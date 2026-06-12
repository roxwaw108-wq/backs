import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publish } from '@/lib/publish';
import { verifySession } from '@/lib/verifySession';
import { buildClaimNotificationFields, sendAdminDiscordNotification } from '@/lib/discord';

export async function GET(req) {
  const userId = new URL(req.url).searchParams.get('userId');

  const query = supabaseAdmin
    .from('claims')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) query.eq('user_id', Number(userId));

  const { data: claims } = await query;

  return NextResponse.json((claims || []).map(mapClaim));
}

export async function POST(req) {
  const body = await req.json();

  const valid = await verifySession(req, Number(body.userId));
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('balance')
    .eq('user_id', Number(body.userId))
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.balance < body.amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

  const { data: updatedUser, error } = await supabaseAdmin
    .from('users')
    .update({ balance: user.balance - body.amount })
    .eq('user_id', Number(body.userId))
    .eq('balance', user.balance)
    .select()
    .single();

  if (error || !updatedUser) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

  const { data: claim } = await supabaseAdmin
    .from('claims')
    .insert({
      user_id: Number(body.userId),
      username: body.username,
      category: body.category,
      cat_id: body.catId,
      item_name: body.itemName,
      item_img: body.itemImg,
      amount: body.amount,
      accent: body.accent,
      chat_messages: [
        {
          id: Date.now(),
          from: 'system',
          text: 'Hello! What is your Roblox username?',
          sender: 'Cheap.gg AI',
          createdAt: new Date().toISOString(),
        },
      ],
    })
    .select()
    .single();

  const mapped = mapClaim(claim);

  await publish(`user-${body.userId}`, { type: 'claims:create', claim: mapped, balance: updatedUser.balance });
  await publish('admin', { type: 'adminClaims:create', claim: mapped });
  await sendAdminDiscordNotification({
    title: 'New Claim Opened',
    description: `A new claim was created by @${body.username}.`,
    color: 0xf5a623,
    fields: buildClaimNotificationFields(claim),
  });

  return NextResponse.json({ claim: mapped, balance: updatedUser.balance });
}

function mapClaim(c) {
  return {
    _id: c.id,
    userId: c.user_id,
    username: c.username,
    category: c.category,
    catId: c.cat_id,
    itemName: c.item_name,
    itemImg: c.item_img,
    amount: c.amount,
    status: c.status,
    accent: c.accent,
    chatMessages: c.chat_messages || [],
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

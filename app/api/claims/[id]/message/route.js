import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publish } from '@/lib/publish';
import { verifySession } from '@/lib/verifySession';
import { buildMessageNotificationFields, sendAdminDiscordNotification } from '@/lib/discord';

export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json();

  const { data: existing } = await supabaseAdmin
    .from('claims')
    .select('chat_messages, user_id')
    .eq('id', id)
    .single();

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Sadece user mesajlarında doğrula, admin mesajlarında değil
  if (body.from === 'user') {
    const valid = await verifySession(req, existing.user_id);
    if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existingMessages = existing.chat_messages || [];
  const updatedMessages = [...existingMessages, body];
  const firstUserReply = body.from === 'user' && !existingMessages.some(message => message.from === 'user');

  if (firstUserReply) {
    updatedMessages.push({
      id: Date.now() + 1,
      from: 'system',
      text: 'Thanks! A Cheap.gg moderator will be with you within 0-15 minutes.',
      sender: 'Cheap.gg AI',
      createdAt: new Date().toISOString(),
    });
  }

  const { data: claim } = await supabaseAdmin
    .from('claims')
    .update({ chat_messages: updatedMessages, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  const mapped = mapClaim(claim);
  await publish(`user-${claim.user_id}`, { type: 'claims:update', claim: mapped });
  await publish('admin', { type: 'adminClaims:update', claim: mapped });
  await sendAdminDiscordNotification({
    title: 'New Claim Chat Message',
    description: `A new message was sent in claim #${id}.`,
    color: body.from === 'mod' ? 0xff5a5a : 0xf5a623,
    fields: buildMessageNotificationFields({
      type: 'Claim Chat',
      owner: claim.username,
      message: body,
      referenceId: id,
      extraFields: [
        { name: 'Item', value: claim.item_name || '-', inline: true },
        { name: 'Status', value: claim.status || '-', inline: true },
      ],
    }),
  });

  return NextResponse.json(mapped);
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

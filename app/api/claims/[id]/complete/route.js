import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publish } from '@/lib/publish';
import { buildClaimNotificationFields, sendAdminDiscordNotification } from '@/lib/discord';

export async function POST(req, { params }) {
  const { id } = await params;

  const { data: claim } = await supabaseAdmin
    .from('claims')
    .update({ status: 'claimed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  const mapped = mapClaim(claim);
  await publish(`user-${claim.user_id}`, { type: 'claims:update', claim: mapped });
  await publish('admin', { type: 'adminClaims:update', claim: mapped });
  await sendAdminDiscordNotification({
    title: 'Claim Marked Completed',
    description: `Claim #${id} was marked as claimed.`,
    color: 0x22c55e,
    fields: buildClaimNotificationFields(claim),
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

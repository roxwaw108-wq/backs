import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publish } from '@/lib/publish';
import { buildWithdrawalNotificationFields, sendAdminDiscordNotification } from '@/lib/discord';

export async function POST(req, { params }) {
  const { id } = await params;

  const { data: existing } = await supabaseAdmin
    .from('withdrawals')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing || existing.status !== 'pending') {
    return NextResponse.json({ error: 'Not found or already processed' }, { status: 400 });
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('balance')
    .eq('user_id', existing.user_id)
    .single();

  await supabaseAdmin
    .from('users')
    .update({ balance: user.balance + existing.amount })
    .eq('user_id', existing.user_id)
    .eq('balance', user.balance);

  const { data: w } = await supabaseAdmin
    .from('withdrawals')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  const mapped = {
    _id: w.id,
    userId: w.user_id,
    username: w.username,
    amount: w.amount,
    account: w.account,
    gamepassId: w.gamepass_id,
    status: w.status,
    createdAt: w.created_at,
    updatedAt: w.updated_at,
  };

  const newBalance = user.balance + existing.amount;

  await publish(`user-${w.user_id}`, { type: 'withdrawals:update', withdrawal: mapped, balance: newBalance });
  await publish('admin', { type: 'adminWithdrawals:update', withdrawal: mapped });
  await sendAdminDiscordNotification({
    title: 'Withdrawal Declined',
    description: `Withdrawal #${id} was declined and refunded.`,
    color: 0xff5a5a,
    fields: buildWithdrawalNotificationFields(w),
  });

  return NextResponse.json(mapped);
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publish } from '@/lib/publish';
import { buildWithdrawalNotificationFields, sendAdminDiscordNotification } from '@/lib/discord';

export async function POST(req, { params }) {
  const { id } = await params;

  const { data: w } = await supabaseAdmin
    .from('withdrawals')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
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

  await publish(`user-${w.user_id}`, { type: 'withdrawals:update', withdrawal: mapped });
  await publish('admin', { type: 'adminWithdrawals:update', withdrawal: mapped });
  await sendAdminDiscordNotification({
    title: 'Withdrawal Marked Completed',
    description: `Withdrawal #${id} was marked as completed.`,
    color: 0x22c55e,
    fields: buildWithdrawalNotificationFields(w),
  });

  return NextResponse.json(mapped);
}

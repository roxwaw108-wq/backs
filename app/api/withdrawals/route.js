import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publish } from '@/lib/publish';
import { verifySession } from '@/lib/verifySession';
import { enforceRateLimit } from '@/lib/rateLimit';
import { buildWithdrawalNotificationFields, sendAdminDiscordNotification } from '@/lib/discord';

export async function GET(req) {
  const limited = enforceRateLimit(req, { name: 'withdrawals:get', limit: 120, windowMs: 60_000 });
  if (limited) return limited;

  const userId = new URL(req.url).searchParams.get('userId');

  const query = supabaseAdmin
    .from('withdrawals')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) query.eq('user_id', Number(userId));

  const { data: withdrawals } = await query;

  return NextResponse.json((withdrawals || []).map(mapWithdrawal));
}

export async function POST(req) {
  const limited = enforceRateLimit(req, { name: 'withdrawals:create', limit: 5, windowMs: 5 * 60_000 });
  if (limited) return limited;

  const body = await req.json();
  const numericUserId = Number(body.userId);
  const numericAmount = Number(body.amount);
  const account = typeof body.account === "string" ? body.account.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const gamepassId = extractNumericId(body.gamepassId);

  if (!Number.isFinite(numericUserId) || numericUserId <= 0 || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return NextResponse.json({ error: "Invalid withdrawal request" }, { status: 400 });
  }
  if (!username) return NextResponse.json({ error: "Invalid withdrawal request" }, { status: 400 });
  if (!account) return NextResponse.json({ error: "Invalid withdrawal request" }, { status: 400 });
  if (!gamepassId) return NextResponse.json({ error: "Invalid gamepass" }, { status: 400 });

  const valid = await verifySession(req, numericUserId);
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('balance')
    .eq('user_id', numericUserId)
    .single();

  if (!user || user.balance < numericAmount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const { data: updatedUser, error } = await supabaseAdmin
    .from('users')
    .update({ balance: user.balance - numericAmount })
    .eq('user_id', numericUserId)
    .eq('balance', user.balance)
    .select()
    .single();

  if (error || !updatedUser) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const { data: w, error: wError } = await supabaseAdmin
    .from('withdrawals')
    .insert({
      user_id: numericUserId,
      username,
      amount: numericAmount,
      account,
      gamepass_id: gamepassId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (wError) {
    console.error('withdrawals insert error:', wError);
    await supabaseAdmin
      .from('users')
      .update({ balance: user.balance })
      .eq('user_id', numericUserId);
    return NextResponse.json({ error: wError?.message || "Withdrawal failed" }, { status: 500 });
  }

  const mapped = mapWithdrawal(w);
  await publish(`user-${numericUserId}`, { type: 'withdrawals:create', withdrawal: mapped, balance: updatedUser.balance });
  await publish('admin', { type: 'adminWithdrawals:create', withdrawal: mapped, userId: numericUserId });
  await sendAdminDiscordNotification({
    title: 'New Withdrawal Request',
    description: `A new withdrawal request was created by @${username}.`,
    color: 0x22c55e,
    fields: buildWithdrawalNotificationFields(w),
  });

  return NextResponse.json({ ...mapped, balance: updatedUser.balance });
}

function mapWithdrawal(w) {
  return {
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
}

function extractNumericId(value) {
  if (typeof value === "number" && Number.isFinite(value)) return String(Math.trunc(value));
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (/^\d+$/.test(v)) return v;
  const patterns = [
    /game-pass\/(\d+)/i,
    /passId=(\d+)/i,
    /id=(\d+)/i,
    /\/(\d+)(?:\b|\/|$)/,
  ];
  for (const p of patterns) {
    const m = v.match(p);
    if (m?.[1]) return m[1];
  }
  const digits = v.replace(/[^\d]/g, "");
  return digits ? digits : null;
}

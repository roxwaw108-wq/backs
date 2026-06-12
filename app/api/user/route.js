import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { enforceRateLimit } from '@/lib/rateLimit';

async function applyReferral(user, refCode) {
  const code = (refCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!code || user.referred_by) return user;

  const { data: affiliate } = await supabaseAdmin
    .from('affiliates')
    .select('*')
    .eq('code', code)
    .single();

  if (!affiliate) return user;
  if (Number(affiliate.user_id) === Number(user.user_id)) return user;

  const alreadyReferred = (affiliate.referrals || []).some(
    r => Number(r.userId) === Number(user.user_id)
  );

  if (!alreadyReferred) {
    const newReferrals = [...(affiliate.referrals || []), {
      userId: Number(user.user_id),
      username: user.username,
      totalEarned: 0,
      joinedAt: new Date().toISOString(),
    }];
    await supabaseAdmin
      .from('affiliates')
      .update({
        signups: (affiliate.signups || 0) + 1,
        referrals: newReferrals,
      })
      .eq('code', code);
  }

  const { data: updatedUser } = await supabaseAdmin
    .from('users')
    .update({ referred_by: code })
    .eq('user_id', user.user_id)
    .select()
    .single();

  return updatedUser || user;
}

export async function GET(request) {
  const limited = enforceRateLimit(request, { name: 'user:get', limit: 120, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const username = searchParams.get('username');
  const displayName = searchParams.get('displayName');
  const avatarUrl = searchParams.get('avatarUrl');
  const refCode = searchParams.get('refCode') || request.cookies.get('cheapgg_ref')?.value;

  let { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('user_id', Number(userId))
    .single();

  if (!user) {
    const sessionToken = crypto.randomUUID();
    const { data: newUser } = await supabaseAdmin
      .from('users')
      .insert({
        user_id: Number(userId),
        username,
        display_name: displayName,
        avatar_url: avatarUrl,
        session_token: sessionToken,
      })
      .select()
      .single();
    user = newUser;
    if (refCode && user) {
      user = await applyReferral(user, refCode);
    }
  } else {
    const shouldRotateSession = Boolean(username || displayName || avatarUrl);
    if (refCode && !user.referred_by) {
      user = await applyReferral(user, refCode);
    }
    const updates = {};
    if (shouldRotateSession) updates.session_token = crypto.randomUUID();
    if (username) updates.username = username;
    if (displayName) updates.display_name = displayName;
    if (avatarUrl) updates.avatar_url = avatarUrl;
    if (Object.keys(updates).length > 0) {
      const { data: updatedUser } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('user_id', Number(userId))
        .select()
        .single();
      user = updatedUser || user;
    }
  }

  const mapped = {
    userId: user.user_id,
    username: user.username,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    balance: user.balance,
    tasksCompleted: user.tasks_completed,
    completedTaskIds: user.completed_task_ids || [],
    affiliateCode: user.affiliate_code,
    referredBy: user.referred_by,
    redeemedCodes: user.redeemed_codes || [],
    sessionToken: user.session_token, // ✅ frontend'e gönder
  };

  if (refCode) {
    const response = NextResponse.json(mapped);
    response.cookies.set('cheapgg_ref', '', { maxAge: 0, path: '/' });
    return response;
  }

  return NextResponse.json(mapped);
}

export async function PATCH(request) {
  const limited = enforceRateLimit(request, { name: 'user:patch', limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { userId, redeemCode, reward } = body;

    if (!userId || !redeemCode) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_id', Number(userId))
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const code = redeemCode.toUpperCase();
    if ((user.redeemed_codes || []).includes(code)) {
      return NextResponse.json({ error: 'already_redeemed' }, { status: 409 });
    }

    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .update({
        redeemed_codes: [...(user.redeemed_codes || []), code],
        balance: (user.balance || 0) + (reward || 0),
      })
      .eq('user_id', Number(userId))
      .select()
      .single();

    return NextResponse.json({
      userId: updatedUser.user_id,
      username: updatedUser.username,
      displayName: updatedUser.display_name,
      avatarUrl: updatedUser.avatar_url,
      balance: updatedUser.balance,
      tasksCompleted: updatedUser.tasks_completed,
      completedTaskIds: updatedUser.completed_task_ids || [],
      redeemedCodes: updatedUser.redeemed_codes || [],
    });
  } catch (error) {
    console.error('User PATCH error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

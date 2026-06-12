import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySession } from '@/lib/verifySession';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function GET(request) {
  const limited = enforceRateLimit(request, { name: 'affiliate:get', limit: 120, windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Code required' }, { status: 400 });
  }

  try {
    const { data: link } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (!link) {
      return NextResponse.json({ clicks: 0, signups: 0, earnings: 0, users: [] });
    }

    return NextResponse.json({
      clicks: link.clicks || 0,
      signups: link.signups || 0,
      earnings: link.earnings || 0,
      users: (link.referrals || []).map(r => ({
        username: r.username,
        totalEarned: r.totalEarned || 0,
        cut: r.cut || 0,
      })),
    });
  } catch (error) {
    console.error('Affiliate GET error:', error);
    return NextResponse.json({ clicks: 0, signups: 0, earnings: 0, users: [] });
  }
}

export async function POST(request) {
  const limited = enforceRateLimit(request, { name: 'affiliate:save', limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { userId, username, code } = await request.json();
    const cleaned = (code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!userId || !cleaned) {
      return NextResponse.json({ error: 'userId and code required' }, { status: 400 });
    }
    if (cleaned.length < 3 || cleaned.length > 20) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    const valid = await verifySession(request, Number(userId));
    if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: taken } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('code', cleaned)
      .neq('user_id', Number(userId))
      .single();

    if (taken) {
      return NextResponse.json({ error: 'This code is already taken' }, { status: 409 });
    }

    const { data: existing } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('user_id', Number(userId))
      .single();

    let link;
    if (existing) {
      const { data } = await supabaseAdmin
        .from('affiliates')
        .update({ code: cleaned, username })
        .eq('user_id', Number(userId))
        .select()
        .single();
      link = data;
    } else {
      const { data } = await supabaseAdmin
        .from('affiliates')
        .insert({ code: cleaned, username, user_id: Number(userId) })
        .select()
        .single();
      link = data;
    }

    await supabaseAdmin
      .from('users')
      .update({ affiliate_code: cleaned })
      .eq('user_id', Number(userId));

    return NextResponse.json({ code: link.code });
  } catch (error) {
    console.error('Affiliate POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

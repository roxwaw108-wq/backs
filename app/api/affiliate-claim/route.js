import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifySession } from "@/lib/verifySession";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  const limited = enforceRateLimit(request, { name: 'affiliate:claim', limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { userId, affiliateCode } = await request.json();

    if (!userId || !affiliateCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const valid = await verifySession(request, Number(userId));
    if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cleaned = String(affiliateCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleaned) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const { data: affiliate } = await supabaseAdmin
      .from('affiliates')
      .select('code, user_id, earnings, referrals')
      .eq('code', cleaned)
      .single();

    if (!affiliate) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    if (Number(affiliate.user_id) !== Number(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const earnings = Number(affiliate.earnings || 0);
    if (!Number.isFinite(earnings) || earnings < 1) {
      return NextResponse.json({ error: "No earnings to claim" }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('user_id', Number(userId))
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .update({ balance: (user.balance || 0) + earnings })
      .eq('user_id', Number(userId))
      .select()
      .single();

    const { data: updatedAffiliate } = await supabaseAdmin
      .from('affiliates')
      .update({ earnings: 0 })
      .eq('code', cleaned)
      .select()
      .single();

    return NextResponse.json({
      success: true,
      balance: updatedUser.balance,
      earnings: 0,
      users: (updatedAffiliate?.referrals || []).map(r => ({
        username: r.username,
        totalEarned: r.totalEarned || 0,
      })),
    });
  } catch (error) {
    console.error("Affiliate claim error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

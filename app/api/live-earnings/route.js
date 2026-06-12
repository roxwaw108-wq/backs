import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const [{ data: cpxTx }, { data: trTx }, { data: twTx }] = await Promise.all([
      supabaseAdmin
        .from('cpx_transactions')
        .select('*')
        .eq('status', 1)
        .order('created_at', { ascending: false })
        .limit(15),
      supabaseAdmin
        .from('theoremreach_transactions')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(15),
      supabaseAdmin
        .from('timewall_transactions')
        .select('*')
        .eq('type', 'credit')
        .order('created_at', { ascending: false })
        .limit(15),
    ]);

    const merged = [...(cpxTx || []), ...(trTx || []), ...(twTx || [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 15);

    const userIds = [...new Set(merged.map(tx => tx.user_id))];
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('user_id, display_name, username, avatar_url')
      .in('user_id', userIds);

    const userMap = Object.fromEntries((users || []).map(u => [u.user_id, u]));

    const items = merged.map(tx => {
      const user = userMap[tx.user_id];
      let source = "CPX-Research";
      if (tx.tx_id)          source = "TheoremReach";
      if (tx.transaction_id) source = "TimeWall";

      return {
        displayName: user?.display_name || "Anonymous",
        username:    user?.username || "",
        avatarUrl:   user?.avatar_url || "",
        tokens:      tx.tokens ?? tx.currency_amount,
        source,
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Live earnings error:", error);
    return NextResponse.json([]);
  }
}
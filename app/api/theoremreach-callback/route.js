import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { publish } from "@/lib/publish";

const SECRET_KEY = process.env.THEOREMREACH_SECRET_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const reward   = searchParams.get("reward");
  const userId   = searchParams.get("user_id");
  const txId     = searchParams.get("tx_id");
  const hash     = searchParams.get("hash");
  const debug    = searchParams.get("debug");
  const reversal = searchParams.get("reversal");

  if (debug === "true") return new NextResponse("OK", { status: 200 });

  const fullUrl        = request.url;
  const urlWithoutHash = fullUrl.replace(/&hash=[^&]*/, "").replace(/[?&]hash=[^&]*$/, "");

  const expectedHash = createHmac("sha1", SECRET_KEY)
    .update(urlWithoutHash)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  if (hash !== expectedHash) {
    console.error("TR hash mismatch | expected:", expectedHash, "| got:", hash);
    return new NextResponse("403 Forbidden", { status: 403 });
  }

  const tokens = parseFloat(reward);

  if (reversal === "true") {
    const { data: tx } = await supabaseAdmin
      .from('theoremreach_transactions')
      .select('*')
      .eq('tx_id', txId)
      .single();

    if (tx && tx.status !== "reversed") {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('user_id', parseInt(userId, 10))
        .single();

      await supabaseAdmin
        .from('users')
        .update({
          balance: (user.balance || 0) - tx.tokens,
          tasks_completed: Math.max(0, (user.tasks_completed || 0) - 1),
        })
        .eq('user_id', parseInt(userId, 10));

      if (user.referred_by) {
        const commission = Math.floor(tx.tokens * 0.1);
        const { data: affiliate } = await supabaseAdmin
          .from('affiliates')
          .select('*')
          .eq('code', user.referred_by)
          .single();

        if (affiliate) {
          const referrals = (affiliate.referrals || []).map(r => {
            if (r.userId === parseInt(userId, 10)) {
              return {
                ...r,
                totalEarned: (r.totalEarned || 0) - tx.tokens,
                cut: (r.cut || 0) - commission,
              };
            }
            return r;
          });

          await supabaseAdmin
            .from('affiliates')
            .update({
              earnings: (affiliate.earnings || 0) - commission,
              referrals,
            })
            .eq('code', user.referred_by);
        }
      }

      await supabaseAdmin
        .from('theoremreach_transactions')
        .update({ status: 'reversed' })
        .eq('tx_id', txId);
    }

    return new NextResponse("OK", { status: 200 });
  }

  const { data: existing } = await supabaseAdmin
    .from('theoremreach_transactions')
    .select('id')
    .eq('tx_id', txId)
    .single();

  if (existing) return new NextResponse("OK", { status: 200 });

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('user_id', parseInt(userId, 10))
    .single();

  if (!user) return new NextResponse("User not found", { status: 404 });

  const { data: updatedUser } = await supabaseAdmin
    .from('users')
    .update({
      balance: (user.balance || 0) + tokens,
      tasks_completed: (user.tasks_completed || 0) + 1,
    })
    .eq('user_id', parseInt(userId, 10))
    .select()
    .single();

  if (user.referred_by) {
    const commission = Math.floor(tokens * 0.1);
    const { data: affiliate } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('code', user.referred_by)
      .single();

    if (affiliate) {
      const referrals = affiliate.referrals || [];
      const refIndex = referrals.findIndex(r => r.userId === parseInt(userId, 10));

      if (refIndex >= 0) {
        referrals[refIndex].totalEarned = (referrals[refIndex].totalEarned || 0) + tokens;
        referrals[refIndex].cut = (referrals[refIndex].cut || 0) + commission;
      } else {
        referrals.push({
          userId: parseInt(userId, 10),
          username: user.username,
          totalEarned: tokens,
          cut: commission,
          joinedAt: new Date().toISOString(),
        });
      }

      await supabaseAdmin
        .from('affiliates')
        .update({
          earnings: (affiliate.earnings || 0) + commission,
          referrals,
        })
        .eq('code', user.referred_by);
    }
  }

  await supabaseAdmin
    .from('theoremreach_transactions')
    .insert({
      tx_id: txId,
      user_id: parseInt(userId, 10),
      tokens,
      status: 'completed',
    });

  try {
    await publish("live-earnings", {
      type: "live:create",
      item: {
        displayName: updatedUser.display_name || updatedUser.username || "Anonymous",
        username: updatedUser.username || "",
        avatarUrl: updatedUser.avatar_url || "",
        tokens,
        source: "TheoremReach",
      },
    });

    await publish(`user-${userId}`, {
      type: "balance:update",
      balance: updatedUser.balance,
      tasksCompleted: updatedUser.tasks_completed,
    });
  } catch (e) {
    console.error("Failed to publish TR events", e);
  }

  return new NextResponse("OK", { status: 200 });
}

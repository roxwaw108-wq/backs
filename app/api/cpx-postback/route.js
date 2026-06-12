import { NextResponse } from "next/server";
import md5 from "md5";
import { supabaseAdmin } from "@/lib/supabase";
import { publish } from '@/lib/publish';

const CPX_SECRET = process.env.CPX_SECRET;

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const trans_id = searchParams.get("trans_id");
  const user_id = searchParams.get("user_id");
  const amount_local = searchParams.get("amount_local");
  const hash = searchParams.get("hash");

  if (!status || !trans_id || !user_id || !amount_local || !hash) {
    return new NextResponse("Missing required parameters", { status: 400 });
  }

  const expectedHash = md5(trans_id + "-" + CPX_SECRET);
  if (hash !== expectedHash) {
    return new NextResponse("Invalid hash", { status: 403 });
  }

  if (status === "1") {
    const { data: existing } = await supabaseAdmin
      .from('cpx_transactions')
      .select('id')
      .eq('trans_id', trans_id)
      .single();

    if (existing) return new NextResponse("Already processed", { status: 200 });

    const tokens = parseFloat(amount_local);

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_id', Number(user_id))
      .single();

    if (!user) return new NextResponse("User not found", { status: 404 });

    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .update({
        balance: (user.balance || 0) + tokens,
        tasks_completed: (user.tasks_completed || 0) + 1,
      })
      .eq('user_id', Number(user_id))
      .select()
      .single();

    await supabaseAdmin
      .from('cpx_transactions')
      .insert({
        trans_id,
        user_id: Number(user_id),
        tokens,
        status: 1,
      });

    if (user.referred_by) {
      const commission = Math.floor(tokens * 0.1);
      const { data: affiliate } = await supabaseAdmin
        .from('affiliates')
        .select('*')
        .eq('code', user.referred_by)
        .single();

      if (affiliate) {
        const referrals = affiliate.referrals || [];
        const refIndex = referrals.findIndex(r => r.userId === Number(user_id));

        if (refIndex >= 0) {
          referrals[refIndex].totalEarned = (referrals[refIndex].totalEarned || 0) + tokens;
          referrals[refIndex].cut = (referrals[refIndex].cut || 0) + commission;
        } else {
          referrals.push({
            userId: Number(user_id),
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

    try {
      await publish('live-earnings', {
        type: 'live:create',
        item: {
          displayName: updatedUser.display_name || updatedUser.username || 'Anonymous',
          username: updatedUser.username || '',
          avatarUrl: updatedUser.avatar_url || '',
          tokens,
          source: 'CPX',
        }
      });

      await publish(`user-${user_id}`, {
        type: 'balance:update',
        balance: updatedUser.balance,
        tasksCompleted: updatedUser.tasks_completed,
      });
    } catch (e) {
      console.error('Failed to publish events', e);
    }

    return new NextResponse("OK", { status: 200 });
  }

  if (status === "2") {
    const { data: tx } = await supabaseAdmin
      .from('cpx_transactions')
      .select('*')
      .eq('trans_id', trans_id)
      .single();

    if (tx && tx.status !== 2) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('user_id', Number(user_id))
        .single();

      if (user) {
        await supabaseAdmin
          .from('users')
          .update({
            balance: Math.max(0, (user.balance || 0) - tx.tokens),
            tasks_completed: Math.max(0, (user.tasks_completed || 0) - 1),
          })
          .eq('user_id', Number(user_id));

        if (user.referred_by) {
          const commission = Math.floor(tx.tokens * 0.1);
          const { data: affiliate } = await supabaseAdmin
            .from('affiliates')
            .select('*')
            .eq('code', user.referred_by)
            .single();

          if (affiliate) {
            const referrals = (affiliate.referrals || []).map(r => {
              if (r.userId === Number(user_id)) {
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
      }

      await supabaseAdmin
        .from('cpx_transactions')
        .update({ status: 2 })
        .eq('trans_id', trans_id);
    }

    return new NextResponse("OK", { status: 200 });
  }

  return new NextResponse("OK", { status: 200 });
}
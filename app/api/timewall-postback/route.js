import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { publish } from "@/lib/publish";

const TIMEWALL_SECRET = process.env.TIMEWALL_SECRET; 

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const user_id        = searchParams.get("user_id");
  const transaction_id = searchParams.get("transaction_id");
  const revenue        = searchParams.get("revenue");
  const currency_amount = searchParams.get("currency_amount");
  const hash           = searchParams.get("hash");
  const type           = searchParams.get("type") || "credit";
  const offer_name     = searchParams.get("offer_name") || "";

  // ── Zorunlu alanlar ──────────────────────────────────────────────────────────
  if (!user_id || !transaction_id || !revenue || !currency_amount || !hash) {
    return new NextResponse("Missing required parameters", { status: 400 });
  }

  // ── Hash doğrulama: sha256(userID + revenue + SecretKey) ─────────────────────
  const expectedHash = crypto
    .createHash("sha256")
    .update(user_id + revenue + TIMEWALL_SECRET)
    .digest("hex");

  if (hash !== expectedHash) {
    return new NextResponse("Invalid hash", { status: 403 });
  }

  // ── hold / hold_cancelled → sadece kayıt et, para verme ─────────────────────
  if (type === "hold" || type === "hold_cancelled") {
    return new NextResponse("OK", { status: 200 });
  }

  const revenueNum  = parseFloat(revenue);
  const currencyNum = parseFloat(currency_amount);

  // ── CREDIT ───────────────────────────────────────────────────────────────────
  if (type === "credit") {
    // Duplicate kontrolü
    const { data: existing } = await supabaseAdmin
      .from("timewall_transactions")
      .select("id")
      .eq("transaction_id", transaction_id)
      .single();

    if (existing) return new NextResponse("Already processed", { status: 200 });

    // Kullanıcıyı çek
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("user_id", Number(user_id))
      .single();

    if (!user) return new NextResponse("User not found", { status: 404 });

    // Bakiyeyi güncelle
    const { data: updatedUser } = await supabaseAdmin
      .from("users")
      .update({
        balance:         (user.balance || 0) + currencyNum,
        tasks_completed: (user.tasks_completed || 0) + 1,
      })
      .eq("user_id", Number(user_id))
      .select()
      .single();

    // Affiliate komisyon
    if (user.referred_by) {
      const commission = Math.floor(currencyNum * 0.1);
      const { data: affiliate } = await supabaseAdmin
        .from("affiliates")
        .select("*")
        .eq("code", user.referred_by)
        .single();

      if (affiliate) {
        const referrals = affiliate.referrals || [];
        const refIndex  = referrals.findIndex(r => r.userId === Number(user_id));

        if (refIndex >= 0) {
          referrals[refIndex].totalEarned = (referrals[refIndex].totalEarned || 0) + currencyNum;
          referrals[refIndex].cut         = (referrals[refIndex].cut || 0) + commission;
        } else {
          referrals.push({
            userId:     Number(user_id),
            username:   user.username,
            totalEarned: currencyNum,
            cut:         commission,
            joinedAt:    new Date().toISOString(),
          });
        }

        await supabaseAdmin
          .from("affiliates")
          .update({
            earnings:  (affiliate.earnings || 0) + commission,
            referrals,
          })
          .eq("code", user.referred_by);
      }
    }

    // İşlemi kaydet
    await supabaseAdmin
      .from("timewall_transactions")
      .insert({
        transaction_id,
        user_id:         Number(user_id),
        revenue:         revenueNum,
        currency_amount: currencyNum,
        type:            "credit",
        offer_name,
      });

    // Realtime yayını
    try {
      await publish("live-earnings", {
        type: "live:create",
        item: {
          displayName: updatedUser.display_name || updatedUser.username || "Anonymous",
          username:    updatedUser.username || "",
          avatarUrl:   updatedUser.avatar_url || "",
          tokens:      currencyNum,
          source:      "TimeWall",
        },
      });

      await publish(`user-${user_id}`, {
        type:           "balance:update",
        balance:        updatedUser.balance,
        tasksCompleted: updatedUser.tasks_completed,
      });
    } catch (e) {
      console.error("Failed to publish events", e);
    }

    return new NextResponse("OK", { status: 200 });
  }

  // ── CHARGEBACK (revenue negatif gelir) ───────────────────────────────────────
  if (type === "chargeback") {
    const { data: tx } = await supabaseAdmin
      .from("timewall_transactions")
      .select("*")
      .eq("transaction_id", transaction_id)
      .single();

    if (tx && tx.type !== "chargeback") {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("user_id", Number(user_id))
        .single();

      if (user) {
        await supabaseAdmin
          .from("users")
          .update({
            balance:         Math.max(0, (user.balance || 0) - tx.currency_amount),
            tasks_completed: Math.max(0, (user.tasks_completed || 0) - 1),
          })
          .eq("user_id", Number(user_id));

        // Affiliate komisyon geri al
        if (user.referred_by) {
          const commission = Math.floor(tx.currency_amount * 0.1);
          const { data: affiliate } = await supabaseAdmin
            .from("affiliates")
            .select("*")
            .eq("code", user.referred_by)
            .single();

          if (affiliate) {
            const referrals = (affiliate.referrals || []).map(r => {
              if (r.userId === Number(user_id)) {
                return {
                  ...r,
                  totalEarned: (r.totalEarned || 0) - tx.currency_amount,
                  cut:         (r.cut || 0) - commission,
                };
              }
              return r;
            });

            await supabaseAdmin
              .from("affiliates")
              .update({
                earnings:  (affiliate.earnings || 0) - commission,
                referrals,
              })
              .eq("code", user.referred_by);
          }
        }
      }

      // İşlemi chargeback olarak işaretle
      await supabaseAdmin
        .from("timewall_transactions")
        .update({ type: "chargeback" })
        .eq("transaction_id", transaction_id);
    }

    return new NextResponse("OK", { status: 200 });
  }

  return new NextResponse("OK", { status: 200 });
}
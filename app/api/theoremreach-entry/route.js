import { createHmac } from "crypto";
import { NextResponse } from "next/server";

const API_KEY     = process.env.THEOREMREACH_API_KEY;
const SECRET_KEY  = process.env.THEOREMREACH_SECRET_KEY;
const PARTNER_ID  = process.env.THEOREMREACH_PARTNER_ID;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  // Her oturum için benzersiz transaction_id
  const transactionId = `${userId}-${Date.now()}`;

  // Hash hesaplamadan önce URL'yi oluştur
  const base = "https://theoremreach.com/respondent_entry/direct";
  const params = new URLSearchParams({
    api_key:                API_KEY,
    user_id:                userId,
    external_id:            userId,
    transaction_id:         transactionId,
    partner_id:             PARTNER_ID,
    currency_name_plural:   "Tokens",
    currency_name_singular: "Token",
    exchange_rate:          "100",   // $1 = 100 Token (kendi oranınıza göre ayarlayın)
  });

  const urlBeforeHash = `${base}?${params.toString()}`;

  // base64(sha1-hmac) — TheoremReach'in istediği format
  const hmac = createHmac("sha1", SECRET_KEY)
    .update(urlBeforeHash)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const finalUrl = `${urlBeforeHash}&hash=${hmac}`;

  return NextResponse.json({ url: finalUrl });
}

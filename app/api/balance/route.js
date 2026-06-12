import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('balance')
    .eq('user_id', Number(userId))
    .single();

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ balance: user.balance });
}

export async function POST(request) {
  try {
    const { userId, amount } = await request.json();

    if (!userId || amount === undefined) {
      return NextResponse.json({ error: "Missing userId or amount" }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('user_id', Number(userId))
      .single();

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .update({ balance: (user.balance || 0) + parseFloat(amount) })
      .eq('user_id', Number(userId))
      .select()
      .single();

    return NextResponse.json({ success: true, balance: updatedUser.balance });
  } catch (error) {
    console.error("Balance update error:", error);
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }
}
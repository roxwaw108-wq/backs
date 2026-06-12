import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  const { userId, amount } = await request.json();

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('balance')
    .eq('user_id', Number(userId))
    .single();

  if (!user || user.balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance or user not found' }, { status: 400 });
  }

  const { data: updatedUser, error } = await supabaseAdmin
    .from('users')
    .update({ balance: user.balance - amount })
    .eq('user_id', Number(userId))
    .eq('balance', user.balance)
    .select()
    .single();

  if (error || !updatedUser) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  return NextResponse.json({ balance: updatedUser.balance });
}
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
  const { ids } = await req.json();

  const updates = ids.map((id, i) =>
    supabaseAdmin.from('shop_items').update({ order: i }).eq('id', id)
  );

  await Promise.all(updates);
  return NextResponse.json({ success: true });
}
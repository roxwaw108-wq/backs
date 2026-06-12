import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let query = supabaseAdmin
    .from('shop_items')
    .select('*')
    .order('order', { ascending: true })
    .order('created_at', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data: items, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(items || []);
}
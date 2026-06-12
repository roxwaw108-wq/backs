import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req) {
  const { category, name, cost, image, badges } = await req.json();
  if (!category || !name || cost == null || !image) {
    return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from('shop_items')
    .select('order')
    .eq('category', category)
    .order('order', { ascending: false })
    .limit(1);

  const nextOrder = existing?.length ? (existing[0].order ?? 0) + 1 : 0;

  const { data, error } = await supabaseAdmin
    .from('shop_items')
    .insert({ category, name, cost, image, badges: badges ?? [], order: nextOrder })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const { category, name, cost, image, badges } = await req.json();

  const { data, error } = await supabaseAdmin
    .from('shop_items')
    .update({ category, name, cost, image, badges: badges ?? [] })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const { error } = await supabaseAdmin
    .from('shop_items')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
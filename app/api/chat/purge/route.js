import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publish } from '@/lib/publish';

export async function POST(req) {
  const { count } = await req.json();

  const { data: msgs } = await supabaseAdmin
    .from('chat_messages')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(count);

  if (msgs && msgs.length > 0) {
    await supabaseAdmin
      .from('chat_messages')
      .delete()
      .in('id', msgs.map(m => m.id));
  }

  const { data: remaining } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(75);

  const mapped = (remaining || []).map(m => ({
    _id: m.id,
    user: m.user,
    avatarId: m.avatar_id,
    avatarUrl: m.avatar_url,
    text: m.text,
    createdAt: m.created_at,
  }));

  await publish('chat', { type: 'chat:refresh', messages: mapped });

  return NextResponse.json({ deleted: msgs?.length || 0 });
}
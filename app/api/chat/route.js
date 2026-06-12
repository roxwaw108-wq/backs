import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publish } from '@/lib/publish';

const BAD_WORDS = ["nigger", "nigga", "bitch", "retard", "retarded", "stupid", "fuck", "pussy", "sex", "fucker", "motherfucker", "ass"];

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's');
}

const lastMsgTime = new Map();
const SPAM_INTERVAL = 1500;

export async function GET() {
  const { data: msgs } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(75);

  return NextResponse.json((msgs || []).map(m => ({
    _id: m.id,
    user: m.user,
    avatarId: m.avatar_id,
    avatarUrl: m.avatar_url,
    text: m.text,
    createdAt: m.created_at,
  })));
}

export async function POST(req) {
  const body = await req.json();

  const text = body.text?.trim() || "";
  const user = body.user?.trim() || "anonymous";

  const normalized = normalizeText(text);
  if (BAD_WORDS.some(word => normalized.includes(word))) {
    return NextResponse.json({ error: 'Inappropriate content' }, { status: 400 });
  }

  if (text.match(/https?:\/\/|www\./i)) {
    return NextResponse.json({ error: 'Links are not allowed' }, { status: 400 });
  }

  const now = Date.now();
  const last = lastMsgTime.get(user) || 0;
  if (now - last < SPAM_INTERVAL) {
    return NextResponse.json({ error: 'You are sending messages too fast' }, { status: 429 });
  }
  lastMsgTime.set(user, now);

  const { data: msg } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      user: body.user,
      avatar_id: body.avatarId,
      avatar_url: body.avatarUrl,
      text: body.text,
    })
    .select()
    .single();

  const { count } = await supabaseAdmin
    .from('chat_messages')
    .select('*', { count: 'exact', head: true });

  if (count > 75) {
    const { data: oldest } = await supabaseAdmin
      .from('chat_messages')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(count - 75);

    await supabaseAdmin
      .from('chat_messages')
      .delete()
      .in('id', oldest.map(m => m.id));
  }

  const mapped = {
    _id: msg.id,
    user: msg.user,
    avatarId: msg.avatar_id,
    avatarUrl: msg.avatar_url,
    text: msg.text,
    createdAt: msg.created_at,
  };

  await publish('chat', { type: 'chat:create', message: mapped });

  return NextResponse.json(mapped);
}
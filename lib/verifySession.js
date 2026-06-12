import { supabaseAdmin } from './supabase';

export async function verifySession(req, userId) {
  const token = req.headers.get("x-session-token");
  if (!token) return false;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('session_token')
    .eq('user_id', userId)
    .single();

  return user?.session_token === token;
}
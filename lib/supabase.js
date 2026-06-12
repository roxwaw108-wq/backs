import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

function getSupabaseAdmin() {
  if (typeof window !== 'undefined') throw new Error('supabaseAdmin is server-only');
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  if (!supabaseServiceKey) throw new Error('SUPABASE_SERVICE_KEY is required');
  return createClient(supabaseUrl, supabaseServiceKey);
}

let _supabaseAdmin = null;
export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!_supabaseAdmin) _supabaseAdmin = getSupabaseAdmin();
      return _supabaseAdmin[prop];
    },
  },
);


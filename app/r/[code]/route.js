import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request, { params }) {
  const { code: rawCode } = await params;
  const code = (rawCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (code) {
    try {
      const { data: existing } = await supabaseAdmin
        .from('affiliates')
        .select('clicks')
        .eq('code', code)
        .single();

      if (existing) {
        await supabaseAdmin
          .from('affiliates')
          .update({ clicks: (existing.clicks || 0) + 1 })
          .eq('code', code);
      }
    } catch (error) {
      console.error('Affiliate link error:', error);
    }
  }

  const redirectUrl = new URL(request.url);
  redirectUrl.pathname = '/';
  redirectUrl.search = '';
  if (code) redirectUrl.searchParams.set('ref', code);

  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    response.cookies.set('cheapgg_ref', code, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }

  return response;
}

import { NextResponse } from 'next/server';

export async function GET(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '8.8.8.8';
  
  const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,proxy,hosting,vpn`);
  const data = await res.json();
  
  const blocked = data.status === 'success' && (data.proxy || data.hosting || data.vpn);
  return NextResponse.json({ blocked });
}

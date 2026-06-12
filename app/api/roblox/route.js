import { NextResponse } from 'next/server';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const userId = searchParams.get('userId');

  try {
    const limited = enforceRateLimit(request, {
      name: 'roblox',
      limit: 30,
      windowMs: 60_000,
    });
    if (limited) return limited;

    if (username) {
      const r = await fetch(`https://users.roblox.com/v1/usernames/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
      });
      const data = await r.json();
      const user = data.data?.[0];
      if (!user) return NextResponse.json({ error: 'bulunamadı' });

      const thumbR = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`);
      const thumbData = await thumbR.json();
      const avatarUrl = thumbData?.data?.[0]?.imageUrl ?? '';

      return NextResponse.json({ Id: user.id, Username: user.name, AvatarUrl: avatarUrl });
    }

    if (userId) {
      const r = await fetch(`https://users.roblox.com/v1/users/${userId}`);
      const data = await r.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'param missing' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

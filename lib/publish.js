export async function publish(channel, payload) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              topic: channel,
              event: 'update',
              payload,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Broadcast failed:', await response.text());
    }
  } catch (e) {
    console.error('Supabase publish error:', e);
  }
}
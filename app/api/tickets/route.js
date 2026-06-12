import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publish } from '@/lib/publish';
import { buildTicketNotificationFields, sendAdminDiscordNotification } from '@/lib/discord';

export async function GET(req) {
  const userId = new URL(req.url).searchParams.get('userId');

  const query = supabaseAdmin
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) query.eq('user_id', Number(userId));

  const { data: tickets } = await query;

  return NextResponse.json((tickets || []).map(mapTicket));
}

export async function POST(req) {
  const body = await req.json();

  const { data: ticket } = await supabaseAdmin
    .from('tickets')
    .insert({
      user_id: Number(body.userId),
      username: body.username,
      display_name: body.displayName,
      reason: body.reason,
      desc: body.desc,
    })
    .select()
    .single();

  const mapped = mapTicket(ticket);
  await publish(`user-${body.userId}`, { type: 'tickets:create', ticket: mapped });
  await publish('admin', { type: 'adminTickets:create', ticket: mapped });
  await sendAdminDiscordNotification({
    title: 'New Support Ticket',
    description: `A new support ticket was opened by @${body.username}.`,
    color: 0x5865f2,
    fields: buildTicketNotificationFields(ticket),
  });

  return NextResponse.json(mapped);
}

function mapTicket(t) {
  return {
    _id: t.id,
    userId: t.user_id,
    username: t.username,
    displayName: t.display_name,
    reason: t.reason,
    desc: t.desc,
    status: t.status,
    messages: t.messages || [],
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
}

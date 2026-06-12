import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publish } from '@/lib/publish';
import { buildMessageNotificationFields, sendAdminDiscordNotification } from '@/lib/discord';

export async function POST(req, { params }) {
  const { id } = await params;
  const { message, status } = await req.json();

  const { data: existing } = await supabaseAdmin
    .from('tickets')
    .select('messages, user_id')
    .eq('id', id)
    .single();

  const updatedMessages = [...(existing.messages || []), message];
  const updates = {
    messages: updatedMessages,
    updated_at: new Date().toISOString(),
  };
  if (status) updates.status = status;

  const { data: ticket } = await supabaseAdmin
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  const mapped = mapTicket(ticket);
  await publish(`user-${ticket.user_id}`, { type: 'tickets:update', ticket: mapped });
  await publish('admin', { type: 'adminTickets:update', ticket: mapped });
  await sendAdminDiscordNotification({
    title: 'New Support Chat Message',
    description: `A new message was sent in support ticket #${id}.`,
    color: message?.from === 'mod' ? 0xff5a5a : 0x5865f2,
    fields: buildMessageNotificationFields({
      type: 'Support Chat',
      owner: ticket.username,
      message,
      referenceId: id,
      extraFields: [
        { name: 'Reason', value: ticket.reason || '-', inline: true },
        { name: 'Status', value: ticket.status || '-', inline: true },
      ],
    }),
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

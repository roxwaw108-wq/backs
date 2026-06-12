const ADMIN_WEBHOOK_URL =
  process.env.DISCORD_ADMIN_WEBHOOK_URL ||
  "https://discord.com/api/webhooks/1512492270551826504/hTaQsz5aP8YIGZbwj8OC95X_fbfEWvcW9gbFREyIL7NjqcrYMgyBDlL6YLTer9864bhS";

function truncate(value, max = 1000) {
  const text = String(value ?? "").trim();
  if (!text) return "-";
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function formatAttachmentCount(message) {
  const count = Array.isArray(message?.attachments) ? message.attachments.length : 0;
  if (!count) return "0";
  return String(count);
}

export async function sendAdminDiscordNotification({
  title,
  description,
  color = 0xf5a623,
  fields = [],
}) {
  if (!ADMIN_WEBHOOK_URL) return;

  try {
    await fetch(ADMIN_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "@everyone",
        allowed_mentions: { parse: ["everyone"] },
        username: "Cheap.gg Alerts",
        embeds: [
          {
            title: truncate(title, 256),
            description: truncate(description, 4096),
            color,
            fields: fields
              .filter(field => field && field.name && field.value !== undefined)
              .slice(0, 25)
              .map(field => ({
                name: truncate(field.name, 256),
                value: truncate(field.value, 1024),
                inline: Boolean(field.inline),
              })),
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (error) {
    console.error("discord webhook failed:", error);
  }
}

export function buildClaimNotificationFields(claim) {
  return [
    { name: "User", value: `@${claim.username || "-"}`, inline: true },
    { name: "Item", value: claim.item_name || claim.itemName || "-", inline: true },
    { name: "Amount", value: String(claim.amount ?? "-"), inline: true },
    { name: "Category", value: claim.category || "-", inline: true },
    { name: "Status", value: claim.status || "ready", inline: true },
    { name: "Claim ID", value: String(claim.id || claim._id || "-"), inline: true },
  ];
}

export function buildWithdrawalNotificationFields(withdrawal) {
  return [
    { name: "User", value: `@${withdrawal.username || "-"}`, inline: true },
    { name: "Amount", value: `R$${withdrawal.amount ?? "-"}`, inline: true },
    { name: "Account", value: `@${withdrawal.account || "-"}`, inline: true },
    { name: "Gamepass ID", value: String(withdrawal.gamepass_id || withdrawal.gamepassId || "-"), inline: true },
    { name: "Status", value: withdrawal.status || "-", inline: true },
    { name: "Withdrawal ID", value: String(withdrawal.id || withdrawal._id || "-"), inline: true },
  ];
}

export function buildTicketNotificationFields(ticket) {
  return [
    { name: "User", value: `@${ticket.username || "-"}`, inline: true },
    { name: "Reason", value: ticket.reason || "-", inline: true },
    { name: "Status", value: ticket.status || "pending", inline: true },
    { name: "Ticket ID", value: String(ticket.id || ticket._id || "-"), inline: true },
    { name: "Details", value: ticket.desc || "-", inline: false },
  ];
}

export function buildMessageNotificationFields({
  type,
  owner,
  message,
  referenceId,
  extraFields = [],
}) {
  return [
    { name: "Type", value: type, inline: true },
    { name: "From", value: message?.from || "-", inline: true },
    { name: "User", value: owner ? `@${owner}` : "-", inline: true },
    { name: "Reference ID", value: String(referenceId || "-"), inline: true },
    { name: "Images", value: formatAttachmentCount(message), inline: true },
    { name: "Message", value: message?.text || "(image only)", inline: false },
    ...extraFields,
  ];
}

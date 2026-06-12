"use client";
import { useState, useEffect, useRef } from "react";
import { ChatMessageContent, PopupChatComposer, buildChatMessage } from "../chat/PopupChatParts";

// ─── SUPPORT CHAT MODAL (USER) ────────────────────────────────────────────────
export function SupportChatModal({ ticket, onClose, displayName, onUpdateTicket }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [ticket?.messages, ticket?._id]);

  async function sendUserPayload(payload) {
    const text = typeof payload?.text === "string" ? payload.text.trim() : "";
    const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
    if (!text && attachments.length === 0) return false;
    const msg = buildChatMessage({ from: "user", text, attachments });
    const res = await fetch(`/api/tickets/${ticket._id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const updated = await res.json();
    onUpdateTicket(updated);
    setInput("");
    return true;
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="claim-chat-modal popup-modal is-open">
        <div className="claim-chat-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎫</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, fontSize: 15, color: "var(--text)" }}>{ticket.reason}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>@{ticket.username} · {ticket.status}</div>
            </div>
            <button onClick={onClose} style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        <div className="claim-chat-messages" ref={scrollRef}>
          {/* desc ilk mesaj olarak göster */}
          {ticket.desc && (
            <div className="claim-chat-message-row is-user msg-fade">
              <div className="claim-chat-sender" style={{ textAlign: "right" }}>{displayName}</div>
              <div className="claim-chat-bubble user">
                <ChatMessageContent message={{ text: ticket.desc, createdAt: ticket.createdAt }} />
              </div>
            </div>
          )}
          {(ticket.messages || []).map((msg, i) => (
            <div key={msg.id || i} className={`claim-chat-message-row ${msg.from === "user" ? "is-user" : msg.from === "system" ? "is-system" : "is-mod"} msg-fade`}>
              {msg.from !== "system" && (
                <div className="claim-chat-sender" style={{ textAlign: msg.from === "user" ? "right" : "left" }}>
                  {msg.from === "mod" ? "ADMIN" : displayName}
                </div>
              )}
              <div className={`claim-chat-bubble ${msg.from === "mod" ? "mod" : msg.from}`}>
                <ChatMessageContent message={msg} />
              </div>
            </div>
          ))}
        </div>

        {ticket.status !== "solved" ? (
          <PopupChatComposer
            value={input}
            onChange={setInput}
            onSend={sendUserPayload}
            placeholder="Reply to support..."
            sendLabel="Send"
          />
        ) : (
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <span style={{ fontSize: 13, fontFamily: "'Fredoka', sans-serif", fontWeight: 800, color: "var(--gg)" }}>✓ This ticket has been resolved</span>
          </div>
        )}
      </div>
    </div>
  );
}

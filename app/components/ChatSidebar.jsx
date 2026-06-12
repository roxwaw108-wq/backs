"use client";
import { useApp } from "../context/AppContext";

export function ChatSidebar() {
  const {
    loggedIn, isAdmin, displayName, globalChat,
    chatScrollRef, chatInputRef, sendGlobalChat,
  } = useApp();

  return (
    <aside className="chat-sidebar">

      {/* ── Header ── */}
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#2ecc71", boxShadow: "0 0 6px rgba(46,204,113,0.6)",
            display: "inline-block", animation: "pulse 2s infinite",
          }} />
          <span className="chat-title">Live Chat</span>
        </div>
      </div>

      {/* ── Mesajlar ── */}
      <div
        className="chat-messages"
        ref={chatScrollRef}
        style={{
          overflowY: "scroll",
          scrollbarWidth: "none",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "10px 8px",
        }}
      >
        <style>{`.chat-messages::-webkit-scrollbar { display: none; }`}</style>

        {globalChat.length === 0 ? (
          <div style={{
            padding: "40px 16px", textAlign: "center",
            color: "var(--text3)", fontSize: 13, fontWeight: 500, lineHeight: 1.7,
          }}>
            Chat Loading...<br />
          </div>
        ) : globalChat.map((msg, i) => {

          if (msg.isSystem) return (
            <div key={msg._id || i} style={{ textAlign: "center", padding: "4px 8px" }}>
              <span className="claim-chat-bubble system">{msg.text}</span>
            </div>
          );

          const isMe  = msg.user === displayName;
          const nameColor = msg.isAdmin ? "var(--red)" : "var(--text)";
          const avatarBorder = msg.isAdmin ? "2px solid rgba(255,90,90,0.40)" : "2px solid rgba(255,255,255,0.10)";
          const cardBg     = isMe ? "rgba(245,166,35,0.07)"    : "rgba(255,255,255,0.035)";
          const cardBorder = isMe ? "1px solid rgba(245,166,35,0.18)" : "1px solid rgba(255,255,255,0.06)";

          return (
            <div
              key={msg._id || i}
              className="msg-fade"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 11,
                background: cardBg,
                border: cardBorder,
                flexShrink: 0,
              }}
            >
              {/* Avatar */}
              <img
                src={msg.avatarUrl || "https://www.gravatar.com/avatar/?d=mp&s=64"}
                onError={e => { e.target.src = "https://www.gravatar.com/avatar/?d=mp&s=64"; }}
                alt={msg.user}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  objectFit: "cover",
                  flexShrink: 0,
                  border: avatarBorder,
                }}
              />

              {/* İçerik */}
              <div style={{ flex: 1, minWidth: 0 }}>

                {/* Üst satır */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 5,
                }}>
                  {/* İsim */}
                  <span style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: 15,
                    fontWeight: 800,
                    color: nameColor,
                    letterSpacing: "0.01em",
                    lineHeight: 1,
                  }}>
                    {msg.user}
                  </span>

                  {/* Admin badge */}
                  {msg.isAdmin && (
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "2px 8px", borderRadius: 20,
                      fontSize: 11, fontWeight: 800,
                      fontFamily: "'Fredoka', sans-serif",
                      background: "rgba(255,90,90,0.10)",
                      color: "var(--red)",
                      border: "1px solid rgba(255,90,90,0.22)",
                      lineHeight: 1,
                    }}>
                      ⚡ Admin
                    </span>
                  )}

                  {/* Saat */}
                  <span className="chat-msg-time">{msg.time}</span>
                </div>

                {/* Mesaj metni */}
                <div className="chat-msg-text" style={{ fontSize: 15 }}>{msg.text}</div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ── Input ── */}
      <div className="chat-input-wrap">
        <div className={`chat-input-row${loggedIn ? " active" : ""}`}>
          <input
            ref={chatInputRef}
            className="chat-input"
            readOnly={!loggedIn}
            placeholder={
              loggedIn
                ? isAdmin
                  ? "Message or !mute user sec / !purge N"
                  : "Type a message..."
                : "Verify your account to chat!"
            }
            onKeyDown={e => { if (e.key === "Enter") sendGlobalChat(); }}
          />
          <button
            type="button"
            className="chat-send-btn"
            onClick={sendGlobalChat}
            disabled={!loggedIn}
            title="Send"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

    </aside>
  );
}

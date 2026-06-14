"use client";

// ─── SUPPORT PAGE ─────────────────────────────────────────────────────────────
export function SupportPage({ loggedIn, openModal, supportReason, setSupportReason, supportDesc, setSupportDesc, supportLoading, supportMsg, supportError, submitSupport, conversations, openSupportChat }) {
  function convStatusBadge(status) {
    if (status === "pending") return { label: "Pending", bg: "rgba(245,166,35,0.12)", color: "var(--cheap)", border: "rgba(245,166,35,0.3)" };
    if (status === "waiting_answer") return { label: "Waiting Answer", bg: "rgba(91,140,255,0.12)", color: "var(--blue)", border: "rgba(91,140,255,0.3)" };
    if (status === "solved") return { label: "Solved", bg: "rgba(79,255,176,0.08)", color: "var(--gg)", border: "rgba(79,255,176,0.2)" };
    return { label: status, bg: "var(--surface2)", color: "var(--text3)", border: "var(--border)" };
  }
  return (
    <div style={{ paddingTop: 40 }}>
      <div className="page-title">Support</div>
      <p className="page-sub">Create a ticket or view your conversations</p>
      {!loggedIn && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(245,166,35,0.07)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "var(--radius)", padding: "14px 20px", marginBottom: 28, fontSize: 14, color: "var(--text2)", fontWeight: 500 }}>
          <span>🔒</span>
          <span>Sign in to access <strong style={{ color: "var(--cheap)", fontFamily: "'Fredoka', sans-serif" }}>Support</strong>.</span>
          <button onClick={openModal} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 800, background: "var(--cheap)", color: "#1a1000", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", marginLeft: "auto", flexShrink: 0 }}>Sign in →</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 40 }}>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 20 }}>New Ticket</div>
          <label className="label-sm">Reason</label>
          <select value={supportReason} onChange={e => setSupportReason(e.target.value)} className="inp" style={{ marginBottom: 16, cursor: loggedIn ? "pointer" : "not-allowed", opacity: loggedIn ? 1 : 0.5 }} disabled={!loggedIn}>
            <option value="">Select a reason...</option>
            <option value="Withdrawal Issue">Withdrawal Issue</option>
            <option value="Account Problem">Account Problem</option>
            <option value="Task Not Credited">Task Not Credited</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Other">Other</option>
          </select>
          <label className="label-sm">Description</label>
          <textarea value={supportDesc} onChange={e => setSupportDesc(e.target.value)} className="inp" rows={4} style={{ marginBottom: 16, resize: "vertical", opacity: loggedIn ? 1 : 0.5 }} placeholder={loggedIn ? "Describe your issue in detail..." : "Sign in to submit a ticket"} disabled={!loggedIn} />
          {supportMsg && <p style={{ fontSize: 13, marginBottom: 12, fontWeight: 600, color: supportError ? "#DC2626" : "var(--gg)" }}>{supportMsg}</p>}
          <button onClick={submitSupport} className="btn-amber" style={{ width: "100%", padding: "13px" }} disabled={!loggedIn || supportLoading}>
            {supportLoading ? <><span className="spinner" />Submitting...</> : "Submit Ticket →"}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>How it works</div>
          {[{ icon: "📝", t: "Create a ticket", d: "Select a reason and describe your issue." }, { icon: "⏱️", t: "We review it", d: "Our team responds within 24 hours." }, { icon: "✅", t: "Issue resolved", d: "Ticket is closed once resolved." }].map((s, i) => (
            <div key={i} className="card" style={{ padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
              <div><div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>{s.t}</div><div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>{s.d}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>Conversations</div>
      {conversations.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
          <div style={{ fontSize: 14, color: "var(--text3)", fontWeight: 500 }}>No conversations yet</div>
        </div>
      ) : conversations.map(conv => {
        const badge = convStatusBadge(conv.status);
        const lastMsg = (conv.messages || [])[conv.messages.length - 1];
        return (
          <div key={conv._id} className="card" style={{ marginBottom: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap" }}>
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{conv.reason}</div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, fontFamily: "'Fredoka', sans-serif", background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{badge.label}</span>
                  <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>{conv.createdAt?.split("T")[0]}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastMsg?.text || conv.desc}</div>
              </div>
              <button type="button" onClick={() => openSupportChat(conv)} className="btn-amber conv-chat-btn" style={{ width: "auto", minWidth: 60, flexShrink: 0, padding: "8px 16px", fontSize: 13, alignSelf: "center" }}>Chat</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
"use client";

export function GuestNotice({ page, onSignIn }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(245,166,35,0.07)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "var(--radius)", padding: "14px 20px", marginBottom: 28, fontSize: 14, color: "var(--text2)", fontWeight: 500 }}>
      <span>🔒</span>
      <span>Sign in to access <strong style={{ color: "var(--cheap)", fontFamily: "'Fredoka', sans-serif" }}>{page}</strong>.</span>
      <button onClick={onSignIn} style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 800, background: "var(--cheap)", color: "#1a1000", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", marginLeft: "auto", flexShrink: 0 }}>Sign in →</button>
    </div>
  );
}

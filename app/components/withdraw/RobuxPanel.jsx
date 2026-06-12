"use client";
import { useState } from "react";
import { TokenCoin } from "../ui/TokenCoin";

// Roblox takes 30% commission, so to receive `amount` robux the gamepass price must be amount / 0.7
function calcGamepassPrice(amount) {
  return Math.ceil(amount / 0.7);
}

export function RobuxPanel({ tokens, setTokens, userId, username, displayName, avatarUrl, robuxRequests, setRobuxRequests, tasks, tasksCompleted, affiliateCode, saveSession, onBack, sessionToken }) {
  const [localAmount, setLocalAmount] = useState("");
  const [localGamepass, setLocalGamepass] = useState("");
  const [localRobloxUsername, setLocalRobloxUsername] = useState(username || "");
  const [localLoading, setLocalLoading] = useState(false);
  const [localMsg, setLocalMsg] = useState("");
  const [localError, setLocalError] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  const robuxValue = parseInt(localAmount) || 0;
  const gamepassPrice = robuxValue > 0 ? calcGamepassPrice(robuxValue) : 0;

  async function handleRobuxWithdraw() {
    setLocalMsg(""); setLocalError(false);
    const amt = parseInt(localAmount);
    if (!amt || amt < 15) { setLocalMsg("Minimum 15 tokens required!"); setLocalError(true); return; }
    if (amt > tokens) { setLocalMsg("Insufficient tokens!"); setLocalError(true); return; }
    if (!localGamepass.trim()) { setLocalMsg("Please enter your Gamepass ID or Link!"); setLocalError(true); return; }
    setLocalLoading(true);
    try {
      const reqBody = { userId, username, amount: amt, account: localRobloxUsername.trim() || username, gamepassId: localGamepass.trim() };
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-session-token": sessionToken || ""
        },
        body: JSON.stringify(reqBody)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Withdrawal failed");
      }
      const w = await res.json();
      const newTokens = w.balance ?? (tokens - amt);
      setTokens(newTokens);
      setRobuxRequests(prev => [w, ...prev]);
      saveSession({ userId, username, displayName, avatarUrl, tokens: newTokens, tasksCompleted, tasks, affiliateCode, sessionToken });
      setLocalMsg(`R$${amt.toLocaleString()} withdrawal request submitted!`);
      setLocalAmount("");
      setLocalGamepass("");
    } catch (err) {
      setLocalMsg(err.message || "Something went wrong, please try again.");
      setLocalError(true);
    }
    setLocalLoading(false);
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text2)", fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "start" }}>

        {/* ── LEFT CARD ── */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>Robux Withdrawal</div>

          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "14px 16px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <img src={avatarUrl} style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid var(--border)" }} onError={e => { e.target.src = "https://www.gravatar.com/avatar/?d=mp"; }} alt="avatar" />
            <div>
              <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, fontSize: 15, color: "var(--text)" }}>{displayName}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>@{username}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Fredoka', sans-serif", fontWeight: 900, fontSize: 15, color: "var(--cheap)" }}>
              <TokenCoin size={16} />{tokens.toLocaleString()}
            </div>
          </div>

          {/* Roblox Username */}
          <label className="label-sm">Roblox Username</label>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <input
              value={localRobloxUsername}
              onChange={e => setLocalRobloxUsername(e.target.value)}
              className="inp"
              placeholder={username}
            />
          </div>

          {/* Amount */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label className="label-sm" style={{ margin: 0 }}>Amount (Tokens)</label>
            <button
              onClick={() => setLocalAmount(String(tokens))}
              style={{ background: "none", border: "none", color: "#f5a623", fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer", padding: 0 }}
            >
              Max
            </button>
          </div>
          <input
            type="number"
            value={localAmount}
            onChange={e => setLocalAmount(e.target.value)}
            className="inp"
            style={{ marginBottom: 6 }}
            placeholder="Enter token amount"
          />
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 16 }}>Min: 15 · Max: {tokens.toLocaleString()}</div>

          {/* Gamepass price hint */}
          {robuxValue >= 15 && (
            <div style={{ marginBottom: 16 }}>
              {/* Header row — always visible */}
              <div
                onClick={() => setInstructionsOpen(o => !o)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: instructionsOpen ? "10px 10px 0 0" : 10,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 14, color: "var(--text)" }}>
                  Set gamepass price to: <span style={{ color: "#f5a623" }}>{gamepassPrice.toLocaleString()} Robux</span>
                </span>
                <span style={{ color: "var(--text3)", fontSize: 18, transition: "transform .2s", transform: instructionsOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
              </div>

              {/* Expandable instructions */}
              {instructionsOpen && (
                <div style={{
                  padding: "16px 18px",
                  background: "var(--surface2)",
                  border: "1px solid rgba(245,166,35,0.18)",
                  borderTop: "none",
                  borderRadius: "0 0 10px 10px",
                  fontSize: 13,
                  color: "var(--text2)",
                  lineHeight: 1.8,
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>How to set up your gamepass:</div>
                  <ol style={{ margin: 0, paddingLeft: 18 }}>
                    <li>Go to <a href="https://create.roblox.com" target="_blank" rel="noreferrer" style={{ color: "#f5a623" }}>Roblox Creator Dashboard ↗</a> and select your Place</li>
                    <li>Scroll down to "Passes" under Monetization</li>
                    <li>Press the (⋮) on your gamepass &amp; click "Open in New Tab"</li>
                    <li>Go to the "Sales" tab</li>
                    <li>Set price to exactly <strong style={{ color: "var(--text)" }}>{gamepassPrice.toLocaleString()} Robux</strong></li>
                    <li>Disable regional pricing</li>
                    <li>Save changes</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Gamepass ID or Link */}
          <label className="label-sm">Gamepass ID or Link</label>
          <input
            value={localGamepass}
            onChange={e => setLocalGamepass(e.target.value)}
            className="inp"
            style={{ marginBottom: 20, fontFamily: "'Fredoka', sans-serif" }}
            placeholder="Enter Gamepass ID or Link"
          />

          {/* Withdraw button */}
          <button
            type="button"
            onClick={handleRobuxWithdraw}
            className="btn-amber"
            style={{ width: "100%", padding: "13px" }}
            disabled={localLoading}
          >
            {localLoading
              ? <><span className="spinner" />Processing...</>
              : `Withdraw${robuxValue > 0 ? ` R$${robuxValue.toLocaleString()}` : ""} →`}
          </button>

          {localMsg && (
            <p style={{ fontSize: 13, marginTop: 12, fontWeight: 600, color: localError ? "#DC2626" : "var(--gg)" }}>
              {localMsg}
            </p>
          )}

          <div style={{ marginTop: 18, padding: "10px 14px", background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.18)", borderRadius: 8, fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>
            <span style={{ color: "var(--cheap)", fontFamily: "'Fredoka', sans-serif", fontWeight: 800 }}>1 token = R$1</span> · Processed in 24–48h
          </div>
        </div>

        {/* ── RIGHT: Withdraw Requests ── */}
        <div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 14 }}>Withdraw Requests</div>
          <div className="card" style={{ overflow: "hidden" }}>
            {robuxRequests.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 13, color: "var(--text3)", fontWeight: 500 }}>No requests yet</div>
              </div>
            ) : (
              <table className="req-table">
                <thead><tr><th>Amount</th><th>Account</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {robuxRequests.map(req => (
                    <tr key={req._id}>
                      <td><span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, color: "var(--cheap)", display: "flex", alignItems: "center", gap: 5 }}><TokenCoin size={13} />R${req.amount?.toLocaleString()}</span></td>
                      <td><span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: "var(--text)" }}>@{req.account}</span></td>
                      <td style={{ color: "var(--text3)", fontSize: 12 }}>{req.createdAt?.split("T")[0]}</td>
                      <td>
                        {req.status === "pending" && (
                          <span className="status-badge status-pending">⏳ Pending</span>
                        )}
                        {req.status === "completed" && (
                          <span className="status-badge status-completed">✓ Completed</span>
                        )}
                        {req.status === "declined" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 11, fontWeight: 800, background: "rgba(220,38,38,0.12)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 6, padding: "2px 8px", display: "inline-block" }}>✕ Gamepass Error</span>
                            <span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 500, maxWidth: 180, lineHeight: 1.4 }}>
                              Your gamepass could not be verified. Please open a{" "}
                              <a href="/support" style={{ color: "#f5a623", textDecoration: "underline", fontWeight: 700 }}>support ticket</a>
                              {" "}for assistance.
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
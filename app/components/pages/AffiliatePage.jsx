"use client";
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";

export function AffiliatePage() {
  const {
    loggedIn, openLoginModal, affiliateCode, affiliateEditing, setAffiliateEditing,
    affiliateEditVal, setAffiliateEditVal, saveAffiliateCode, affiliateStats,
    setAffiliateStats,
    userId, tokens, setTokens, saveSession, displayName, username, avatarUrl, tasks, tasksCompleted,
    sessionToken,
  } = useApp();

  const [origin, setOrigin] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMsg, setClaimMsg] = useState("");
  const [claimError, setClaimError] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const previewCode    = "YOURCODE";
  const displayCode    = loggedIn ? affiliateCode    : previewCode;
  const referralPath   = `/r/${displayCode}`;
  const fullLink       = origin ? `${origin}${referralPath}` : referralPath;

  const previewStats = {
    earnings: 0,
    users: [
      { username: "user123", totalEarned: 1200, cut: 120 },
      { username: "gamer99", totalEarned:  850, cut:  85 },
    ],
  };
  const displayStats = loggedIn ? affiliateStats : previewStats;

  async function handleClaimEarnings() {
    setClaimMsg("");
    setClaimError(false);
    if (!affiliateStats.earnings || affiliateStats.earnings < 1) {
      setClaimMsg("No earnings to claim!");
      setClaimError(true);
      return;
    }
    setClaimLoading(true);
    try {
      const claimedAmount = affiliateStats.earnings;
      const res = await fetch("/api/affiliate-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-token": sessionToken || "" },
        body: JSON.stringify({ userId, affiliateCode, amount: claimedAmount }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Claim failed");
      }
      const data = await res.json();
      const newTokens = data.balance ?? (tokens + claimedAmount);
      setTokens(newTokens);
      saveSession({ userId, username, displayName, avatarUrl, tokens: newTokens, tasksCompleted, tasks, affiliateCode });
      setAffiliateStats(prev => ({ ...prev, earnings: data.earnings ?? 0, users: data.users ?? prev.users }));
      setClaimMsg(`Successfully claimed ${claimedAmount.toLocaleString()} tokens! ✓`);
    } catch (err) {
      setClaimMsg(err.message || "Something went wrong, please try again.");
      setClaimError(true);
    }
    setClaimLoading(false);
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <div className="page-title">Affiliate</div>
      <p className="page-sub">Share your link and earn tokens from your referrals</p>

      {!loggedIn && (
        <div style={{
          marginBottom: 24,
          padding: "14px 18px",
          background: "rgba(245,166,35,0.08)",
          border: "1px solid rgba(245,166,35,0.30)",
          borderRadius: 12,
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <span>
            <span
              onClick={openLoginModal}
              style={{ color: "var(--cheap)", fontWeight: 800, cursor: "pointer", textDecoration: "underline" }}
            >
              Sign in
            </span>
            {" "}to get your referral link and start earning.
          </span>
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}
        onClick={!loggedIn ? openLoginModal : undefined}
      >
        {/* ── Left card: link & earnings ── */}
        <div
          className="card"
          style={{
            padding: 28,
            filter: loggedIn ? "none" : "blur(2px)",
            userSelect: loggedIn ? "auto" : "none",
            cursor: loggedIn ? "default" : "pointer",
            pointerEvents: loggedIn ? "auto" : "none",
          }}
        >
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>
            Your Referral Link
          </div>

          <label className="label-sm">Your Code</label>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <div style={{ padding: "11px 14px", background: "var(--surface2)", border: "1px solid rgba(245,166,35,0.35)", borderRadius: "var(--radius-sm)", fontSize: 14, color: "var(--cheap)", fontWeight: 700, fontFamily: "'Fredoka', sans-serif", letterSpacing: "0.05em", minWidth: 80, minHeight: 42 }}>
              {displayCode}
            </div>
            {affiliateEditing ? (
              <>
                <input
                  value={affiliateEditVal}
                  onChange={e => setAffiliateEditVal(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  className="inp"
                  style={{ width: "280px", minWidth: 0, padding: "12px 16px" }}
                  maxLength="20"
                  placeholder="New code"
                />
                <button type="button" onClick={saveAffiliateCode} className="btn-amber" style={{ padding: "12px 20px", fontSize: 13, flexShrink: 0 }}>Save</button>
              </>
            ) : (
              <>
                <div style={{ flex: 1, padding: "11px 14px", background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: "var(--radius-sm)", fontFamily: "'Fredoka', sans-serif", fontSize: 13, color: "var(--text2)", wordBreak: "break-all", letterSpacing: "0.02em", minHeight: 42 }}>
                  {displayCode}
                </div>
                <button type="button" onClick={() => { setAffiliateEditVal(affiliateCode); setAffiliateEditing(true); }} className="btn-outline" style={{ padding: "11px 16px", fontSize: 13, flexShrink: 0 }}>Edit</button>
              </>
            )}
          </div>

          <label className="label-sm">Full Link</label>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            <div style={{ flex: "1 1 180px", minWidth: 0, padding: "11px 14px", background: "var(--surface2)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text2)", wordBreak: "break-all", fontFamily: "'Fredoka', sans-serif", letterSpacing: "0.02em" }}>
              {fullLink}
            </div>
            <button type="button" onClick={() => navigator.clipboard.writeText(fullLink)} className="btn-amber" style={{ padding: "11px 18px", fontSize: 13, flex: "0 0 auto" }}>Copy</button>
          </div>

          <div style={{ padding: "12px 16px", background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: 8, fontSize: 13, color: "var(--text2)", marginBottom: 20 }}>
            <span style={{ color: "var(--cheap)", fontFamily: "'Fredoka', sans-serif", fontWeight: 800 }}>Earn 10%</span> from every token your affiliated users claim
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--surface2)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--cheap)" }}>
                {displayStats.earnings.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600 }}>Earnings</div>
            </div>
            <button
              type="button"
              onClick={handleClaimEarnings}
              className="btn-amber"
              style={{ padding: "8px 16px", fontSize: 13 }}
              disabled={claimLoading || !loggedIn || affiliateStats.earnings < 1}
            >
              {claimLoading ? <><span className="spinner" />Claiming...</> : "Claim"}
            </button>
          </div>

          {claimMsg && (
            <p style={{ fontSize: 13, marginTop: 12, fontWeight: 600, color: claimError ? "#DC2626" : "var(--gg)" }}>
              {claimMsg}
            </p>
          )}
        </div>

        {/* ── Right card: affiliated users ── */}
        <div
          className="card"
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            filter: loggedIn ? "none" : "blur(2px)",
            userSelect: loggedIn ? "auto" : "none",
            cursor: loggedIn ? "default" : "pointer",
            pointerEvents: loggedIn ? "auto" : "none",
          }}
        >
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>
            Affiliated Users
          </div>
          {displayStats.users.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", color: "var(--text3)", fontSize: 14 }}>
              No affiliated users yet. Share your link to start earning!
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="req-table" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Total Earned</th>
                    <th>Your Cut (10%)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStats.users.map((u, i) => (
                    <tr key={i}>
                      <td style={{ color: "var(--text)", fontWeight: 600 }}>{u.username}</td>
                      <td>{(u.totalEarned ?? 0).toLocaleString()} tokens</td>
                      <td style={{ color: "var(--cheap)", fontWeight: 700 }}>+{(u.cut ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
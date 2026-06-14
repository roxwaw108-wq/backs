"use client";
import { useApp } from "../../context/AppContext";
import { TokenCoin } from "../ui/TokenCoin";
import { ClaimItemImage } from "../ui/ClaimItemImage";

export function ClaimsPage() {
  const { loggedIn, openLoginModal, claimsData, openClaimChat } = useApp();

  const nonRobuxClaims = claimsData.filter(r => r.catId !== "robux");
  const readyClaims = nonRobuxClaims.filter(r => r.status === "ready");
  const claimedClaims = nonRobuxClaims.filter(r => r.status === "claimed");

  // Mock preview items shown to guests
  const previewItems = [
    { _id: "p1", itemName: "PlayStation Gift Card", amount: 5000, accent: "#003087" },
    { _id: "p2", itemName: "Steam Wallet $10",      amount: 3200, accent: "#1b2838" },
    { _id: "p3", itemName: "Amazon Gift Card",      amount: 4100, accent: "#ff9900" },
  ];

  const displayReady   = loggedIn ? readyClaims   : previewItems;
  const displayClaimed = loggedIn ? claimedClaims : [];

  function handleGatedClick(e) {
    if (!loggedIn) {
      e.preventDefault();
      e.stopPropagation();
      openLoginModal();
    }
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <div className="page-title">Claims</div>
      <p className="page-sub">Chat with a moderator to claim your items</p>

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
            {" "}to view and manage your claims.
          </span>
        </div>
      )}

      {loggedIn && nonRobuxClaims.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>No claims yet</div>
          <div style={{ fontSize: 14, color: "var(--text3)", fontWeight: 500 }}>Purchase an item from Withdraw to see claims here</div>
        </div>
      ) : (
        <div>
          {displayReady.length > 0 && (
            <>
              <div style={{
                fontSize: 11, fontFamily: "'Fredoka', sans-serif", fontWeight: 800,
                color: "var(--cheap)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
              }}>
                {loggedIn ? "Open — Waiting for moderator" : "Example Claims"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginBottom: 24 }}>
                {displayReady.map(claim => {
                  const accent = claim.accent || "var(--cheap)";
                  const hasNewModMsg = loggedIn && (claim.chatMessages || []).some(m => m.from === "mod");
                  return (
                    <div
                      key={claim._id}
                      onClick={!loggedIn ? openLoginModal : undefined}
                      style={{
                        background: "var(--surface)",
                        border: `1px solid ${accent}44`,
                        borderRadius: "var(--radius)",
                        padding: "14px 16px",
                        position: "relative",
                        cursor: loggedIn ? "default" : "pointer",
                        filter: loggedIn ? "none" : "blur(1.5px)",
                        userSelect: loggedIn ? "auto" : "none",
                        transition: "transform 0.15s ease",
                      }}
                      onMouseEnter={e => { if (!loggedIn) e.currentTarget.style.transform = "scale(1.01)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                    >
                      {hasNewModMsg && (
                        <span className="waiting-dot" style={{ position: "absolute", top: 8, right: 8 }} />
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <ClaimItemImage itemImg={claim.itemImg} itemName={claim.itemName} size={48} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 14,
                            color: "var(--text)", marginBottom: 4,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {claim.itemName}
                          </div>
                          <div className="token-amount-row">
                            <TokenCoin size={12} />
                            <span>{claim.amount?.toLocaleString()} tokens</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={loggedIn ? () => openClaimChat(claim) : openLoginModal}
                          className="btn-amber claim-card-chat-btn"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {displayClaimed.length > 0 && (
            <>
              <div style={{
                fontSize: 11, fontFamily: "'Fredoka', sans-serif", fontWeight: 800,
                color: "var(--text3)", textTransform: "uppercase",
                marginBottom: 10, marginTop: displayReady.length ? 20 : 0,
              }}>
                Completed
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                {displayClaimed.map(claim => (
                  <div key={claim._id} className="card" style={{ padding: "14px 16px", opacity: 0.7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <ClaimItemImage itemImg={claim.itemImg} itemName={claim.itemName} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 14 }}>{claim.itemName}</div>
                        <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 12, fontWeight: 800, color: "var(--cheap)" }}>Claimed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
"use client";
import { useApp } from "../../context/AppContext";
import { GuestNotice } from "../ui/GuestNotice";
import { TokenCoin } from "../ui/TokenCoin";
import { ClaimItemImage } from "../ui/ClaimItemImage";

export function ClaimsPage() {
  const { loggedIn, openLoginModal, claimsData, openClaimChat } = useApp();

  const nonRobuxClaims = claimsData.filter(r => r.catId !== "robux");
  const readyClaims = nonRobuxClaims.filter(r => r.status === "ready");
  const claimedClaims = nonRobuxClaims.filter(r => r.status === "claimed");

  return (
    <div style={{ paddingTop: 40 }}>
      <div className="page-title">Claims</div>
      <p className="page-sub">Chat with a moderator to claim your items</p>
      {!loggedIn && <GuestNotice page="Claims" onSignIn={openLoginModal} />}

      {nonRobuxClaims.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", opacity: loggedIn ? 1 : 0.4 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>No claims yet</div>
          <div style={{ fontSize: 14, color: "var(--text3)", fontWeight: 500 }}>Purchase an item from Withdraw to see claims here</div>
        </div>
      ) : (
        <div style={{ opacity: loggedIn ? 1 : 0.4, pointerEvents: loggedIn ? "auto" : "none" }}>
          {readyClaims.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontFamily: "'Fredoka', sans-serif", fontWeight: 800, color: "var(--cheap)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Open — Waiting for moderator</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", marginBottom: 24 }}>
                {readyClaims.map(claim => {
                  const accent = claim.accent || "var(--cheap)";
                  const hasNewModMsg = (claim.chatMessages || []).some(m => m.from === "mod");
                  return (
                    <div key={claim._id} style={{ background: "var(--surface)", border: `1px solid ${accent}44`, borderRadius: "var(--radius)", padding: "14px 16px", position: "relative" }}>
                      {hasNewModMsg && <span className="waiting-dot" style={{ position: "absolute", top: 8, right: 8 }} />}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <ClaimItemImage itemImg={claim.itemImg} itemName={claim.itemName} size={48} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 800, fontSize: 14, color: "var(--text)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{claim.itemName}</div>
                          <div className="token-amount-row">
                            <TokenCoin size={12} />
                            <span>{claim.amount?.toLocaleString()} tokens</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => openClaimChat(claim)} className="btn-amber claim-card-chat-btn">Chat</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {claimedClaims.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontFamily: "'Fredoka', sans-serif", fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", marginBottom: 10, marginTop: readyClaims.length ? 20 : 0 }}>Completed</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                {claimedClaims.map(claim => (
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

"use client";
import { useApp } from "../context/AppContext";
import { Logo } from "./ui/Logo";
import { TokenCoin } from "./ui/TokenCoin";
import { ClaimItemImage } from "./ui/ClaimItemImage";
import { SupportChatModal } from "./support/SupportChatModal";
import { ChatMessageContent, PopupChatComposer } from "./chat/PopupChatParts";

export function AppModals() {
  const app = useApp();
  const {
    loginModal, closeLoginModal, step, loading, errorMsg, successMsg,
    username, setUsername, userId, displayName, avatarUrl, verifyCode, copied,
    fetchUser, checkBio, copyCode, setStep, setErrorMsg,
    redeemModal, setRedeemModal, redeemCode, setRedeemCode, redeemLoading, redeemMsg, redeemError, submitRedeem,
    buyModal, setBuyModal, buyLoading, confirmBuy, tokens,
    claimChatModal, closeClaimChat, claimChatInput, setClaimChatInput, sendClaimMessage,
    claimChatScrollRef, renderChatText,
    supportChatTicket, setSupportChatTicket, updateTicketInState,
  } = app;

  return (
    <>
      {loginModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeLoginModal()}>
          <div className="modal-box">
            <div className="modal-left">
              {step === "username" ? (
                <div>
                  <Logo />
                  <div style={{ marginTop: 28, marginBottom: 24 }}>
                    <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 6, color: "var(--text)", letterSpacing: "-0.02em" }}>Sign in</h2>
                    <p style={{ fontSize: 14, color: "var(--text2)", fontWeight: 500 }}>Enter your Roblox username to continue</p>
                  </div>
                  <label className="label-sm">Roblox Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchUser()} className="inp" style={{ marginBottom: 12 }} placeholder="Your username" disabled={loading} autoFocus />
                  {errorMsg && <p style={{ color: "#DC2626", fontSize: 14, marginBottom: 12, fontWeight: 600 }}>{errorMsg}</p>}
                  <button type="button" onClick={fetchUser} className="btn-amber" style={{ width: "100%", padding: "14px" }} disabled={loading}>
                    {loading ? <><span className="spinner" />Searching...</> : "Continue →"}
                  </button>
                </div>
              ) : (
                <div>
                  <button type="button" onClick={() => { setStep("username"); setErrorMsg(""); }} style={{ background: "none", border: "none", color: "var(--text2)", fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 24 }}>← Back</button>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                    <img src={avatarUrl} style={{ width: 52, height: 52, borderRadius: 14, border: "2px solid var(--border)" }} onError={e => { e.target.src = "https://www.gravatar.com/avatar/?d=mp"; }} alt="avatar" />
                    <div>
                      <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, fontSize: 17, color: "var(--text)" }}>{displayName}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>@{username} · ID {userId}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 10, fontWeight: 500 }}>Add this code to your Roblox <strong style={{ color: "var(--text)", fontFamily: "'Fredoka', sans-serif" }}>About / Bio</strong>:</p>
                  <div className="code-block" onClick={copyCode}>{verifyCode}</div>
                  <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 24, marginTop: 6, fontWeight: 500 }}>{copied ? "✅ Copied to clipboard!" : "Click to copy"}</p>
                  {errorMsg && <p style={{ color: "#DC2626", fontSize: 14, marginBottom: 12, fontWeight: 600 }}>{errorMsg}</p>}
                  {successMsg && <p style={{ color: "var(--gg)", fontSize: 14, marginBottom: 12, fontWeight: 600 }}>{successMsg}</p>}
                  <button type="button" onClick={checkBio} className="btn-amber" style={{ width: "100%", padding: "14px" }} disabled={loading}>
                    {loading ? <><span className="spinner" />Checking...</> : "Verify & Sign In"}
                  </button>
                </div>
              )}
            </div>
            <div className="modal-right">
              <button type="button" onClick={closeLoginModal} style={{ position: "absolute", top: 20, right: 20, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>✕</button>
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Logo />
                <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7, marginTop: 12, fontWeight: 500 }}>Earn tokens by playing games,<br />completing tasks & inviting friends.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {redeemModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRedeemModal(false)}>
          <div className="redeem-modal popup-modal">
            <button type="button" onClick={() => { setRedeemModal(false); setRedeemCode(""); }} style={{ position: "absolute", top: 16, right: 16, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", width: 32, height: 32, borderRadius: 8, cursor: "pointer" }}>✕</button>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text)", marginBottom: 28 }}>Redeem Code</div>
            <input value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && submitRedeem()} className="inp" style={{ marginBottom: 16 }} placeholder='"CODE"' autoFocus />
            {redeemMsg && <div style={{ marginBottom: 16, padding: "12px 16px", fontSize: 13, fontWeight: 600, color: redeemError ? "#DC2626" : "var(--cheap)", background: redeemError ? "transparent" : "rgba(245,166,35,0.08)", border: redeemError ? "none" : "1px solid rgba(245,166,35,0.25)", borderRadius: 8 }}>{redeemMsg}</div>}
            <button type="button" onClick={submitRedeem} className="btn-amber" style={{ width: "100%", padding: "14px" }} disabled={redeemLoading}>{redeemLoading ? "Checking..." : "Redeem →"}</button>
          </div>
        </div>
      )}

      {buyModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !buyLoading && setBuyModal(null)}>
          <div className="buy-modal popup-modal">
            {/* Item resmi */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <img
                src={`/icons/${buyModal.item.image}`}
                alt={buyModal.item.name}
                style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface2)", padding: 8 }}
              />
            </div>

            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text)", marginBottom: 6, textAlign: "center" }}>
              Confirm Purchase
            </div>
            <div style={{ fontSize: 14, color: "var(--text2)", fontWeight: 600, textAlign: "center", marginBottom: 22 }}>
              {buyModal.item.name}
            </div>

            {/* Balance bilgileri */}
            <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "var(--text2)", fontWeight: 600 }}>
                <span>Current balance</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text)" }}>
                  <TokenCoin size={13} /> {tokens.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "var(--text2)", fontWeight: 600 }}>
                <span>Item price</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#DC2626" }}>
                  − <TokenCoin size={13} /> {buyModal.item.cost.toLocaleString()}
                </span>
              </div>
              <div style={{ height: 1, background: "var(--border)", margin: "2px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontFamily: "'Fredoka', sans-serif", fontWeight: 900, color: "var(--text)" }}>
                <span>Balance after</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--cheap)" }}>
                  <TokenCoin size={14} /> {(tokens - buyModal.item.cost).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => !buyLoading && setBuyModal(null)} className="btn-outline" style={{ flex: 1 }} disabled={buyLoading}>Cancel</button>
              <button type="button" onClick={confirmBuy} className="btn-amber" style={{ flex: 2 }} disabled={buyLoading}>{buyLoading ? "Processing..." : "Confirm →"}</button>
            </div>
          </div>
        </div>
      )}

      {claimChatModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeClaimChat()}>
          <div className="claim-chat-modal popup-modal is-open">
            <div className="claim-chat-header">
              <ClaimItemImage itemImg={claimChatModal.itemImg} itemName={claimChatModal.itemName} size={48} />
              <div className="claim-chat-header-info">
                <div className="claim-chat-header-title">{claimChatModal.itemName}</div>
                <div className="token-amount-row">
                  <TokenCoin size={12} />
                  <span>{claimChatModal.amount?.toLocaleString()} tokens</span>
                </div>
              </div>
              <button type="button" className="claim-chat-close" onClick={closeClaimChat} aria-label="Close">✕</button>
            </div>
            <div className="claim-chat-messages" ref={claimChatScrollRef}>
              {(claimChatModal.chatMessages || []).length === 0 && (
                <div className="claim-chat-empty">
                  Start the conversation here. You can also paste an image directly into the chat.
                </div>
              )}
              {(claimChatModal.chatMessages || []).map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`claim-chat-message-row ${msg.from === "user" ? "is-user" : msg.from === "system" ? "is-system" : "is-mod"}`}
                >
                  {msg.from !== "system" && (
                    <div className="claim-chat-sender" style={{ textAlign: msg.from === "user" ? "right" : "left" }}>
                      {msg.from === "user" ? "You" : "ADMIN"}
                    </div>
                  )}
                  <div className={`claim-chat-bubble ${msg.from}`}>
                    <ChatMessageContent message={msg} renderText={renderChatText} />
                  </div>
                </div>
              ))}
            </div>
            {claimChatModal.status !== "claimed" && (
              <PopupChatComposer
                value={claimChatInput}
                onChange={setClaimChatInput}
                onSend={sendClaimMessage}
                placeholder="Reply to the claim..."
                sendLabel="Send"
              />
            )}
          </div>
        </div>
      )}

      {supportChatTicket && (
        <SupportChatModal ticket={supportChatTicket} onClose={() => setSupportChatTicket(null)} displayName={displayName} onUpdateTicket={updateTicketInState} />
      )}
    </>
  );
}

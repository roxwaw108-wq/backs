"use client";
import { useApp } from "../../context/AppContext";
import { TokenCoin } from "../ui/TokenCoin";

/* ─── Avatar Frame ────────────────────────────────────────── */
function AvatarFrame({ src, size = 88, onError }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: 13,
        border: `3px solid rgba(255,255,255,0.10)`,
        overflow: "hidden",
        boxSizing: "border-box",
      }}>
        <img
          src={src}
          alt="avatar"
          onError={onError}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    </div>
  );
}

/* ─── Stat Kart ───────────────────────────────────────────── */
function StatCard({ label, value, accent }) {
  return (
    <div className="stat-mini" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{
        fontSize: 11, color: "var(--text3)", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.08em",
        fontFamily: "'Fredoka', sans-serif",
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Fredoka', sans-serif",
        fontSize: 20, fontWeight: 900,
        color: accent ?? "var(--text)",
        letterSpacing: "-0.02em",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        {value}
      </div>
    </div>
  );
}

/* ─── Ana Bileşen ─────────────────────────────────────────── */
export function ProfilePage() {
  const {
    loggedIn, openLoginModal, displayName, username,
    userId, avatarUrl, tokens, tasksCompleted, isAdmin,
    logout,
  } = useApp();

  if (!loggedIn) {
    return (
      <div style={{ paddingTop: 40 }}>
        <div className="page-title">Profile</div>
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "var(--text2)", marginBottom: 16 }}>
            Sign in to view your profile.
          </p>
          <button type="button" className="btn-amber" onClick={openLoginModal}>
            Sign in →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <div className="page-title">Profile</div>

      <div className="card" style={{ padding: 32, maxWidth: 480 }}>

        {/* ── Üst bölüm: Avatar + İsim ── */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 24,
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: "1px solid var(--border)",
        }}>
          <AvatarFrame
            src={avatarUrl}
            size={88}
            onError={e => { e.target.src = "https://www.gravatar.com/avatar/?d=mp"; }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: 22, fontWeight: 900,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 4,
            }}>
              {displayName}
            </div>

            <div style={{
              fontSize: 12, color: "var(--text3)",
              fontWeight: 600, marginBottom: 10,
            }}>
              @{username}
              <span style={{ margin: "0 6px", color: "var(--border2)" }}>·</span>
              ID {userId}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {isAdmin && (
                <div style={{
                  fontSize: 11, fontFamily: "'Fredoka', sans-serif", fontWeight: 800,
                  color: "var(--red)",
                  background: "rgba(255,77,77,0.08)",
                  border: "1px solid rgba(255,77,77,0.22)",
                  borderRadius: 6, padding: "3px 10px",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  ⚡ Administrator
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}>
          <StatCard
            label="Tokens"
            value={
              <>
                <TokenCoin size={16} />
                {Math.floor(tokens).toLocaleString("en-US")}
              </>
            }
          />
          <StatCard
            label="Tasks Done"
            value={tasksCompleted}
          />
        </div>

        {/* ── Logout Butonu ── */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            className="btn-outline"
            onClick={logout}
            style={{
              width: "100%",
              padding: "12px 0",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Fredoka', sans-serif",
              borderRadius: 10,
              color: "#ff5a5a",
              border: "1px solid rgba(255,90,90,0.30)",
              background: "rgba(255,90,90,0.06)",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>

      </div>
    </div>
  );
}
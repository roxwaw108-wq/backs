"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import md5 from "md5";
import { useApp } from "../../context/AppContext";
import { Logo } from "../ui/Logo";
import { TokenCoin } from "../ui/TokenCoin";
import { supabase } from "@/lib/supabase";

const CPX_SECRET        = process.env.NEXT_PUBLIC_CPX_SECRET;
const BITLABS_APP_TOKEN = process.env.NEXT_PUBLIC_BITLABS_APP_TOKEN;
const TIMEWALL_OID      = process.env.NEXT_PUBLIC_TIMEWALL_OID;

// ─── Toast Notification ───────────────────────────────────────────────────────
function ToastNotification({ toasts, onRemove }) {
  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 999999,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10,
        pointerEvents: "none", width: "max-content", maxWidth: "calc(100vw - 48px)",
      }}>
        {toasts.map(toast => (
          <div key={toast.id} onClick={() => onRemove(toast.id)} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: toast.type === "already"
              ? "linear-gradient(135deg, #fde9f0 0%, #f8ccd9 100%)"
              : "linear-gradient(135deg, #ecfaf2 0%, #cfeede 100%)",
            border: "1px solid " + (toast.type === "already" ? "rgba(229,106,162,0.18)" : "rgba(47,163,111,0.18)"),
            borderRadius: 12, padding: "13px 20px", minWidth: 280, maxWidth: 420,
            boxShadow: "0 16px 36px rgba(76,88,110,0.16)", pointerEvents: "all",
            animation: "toastIn 0.25s cubic-bezier(.34,1.4,.64,1) both", cursor: "default",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              border: "2px solid rgba(36,48,66,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {toast.type === "already" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#243042" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#243042" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text)", lineHeight: 1.3 }}>
              {toast.text}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── AvatarFrame ──────────────────────────────────────────────────────────────
function AvatarFrame({ src, size = 64, onError }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: 13,
        border: "3px solid rgba(229,106,162,0.18)", overflow: "hidden", boxSizing: "border-box",
      }}>
        <img src={src} alt="avatar" onError={onError}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );
}

// ─── LiveEarningsStrip ────────────────────────────────────────────────────────
function LiveEarningsStrip() {
  const { liveEarnings } = useApp();
  const items = (liveEarnings || []).slice(0, 15);
  if (items.length === 0) return null;

  const shortSource = (s) =>
    (s || "")
      .replace("TheoremReach", "Theorem").replace("CPXResearch", "CPX")
      .replace("Cpx-research", "CPX").replace("cpx-research", "CPX")
      .replace("cpx_research", "CPX").replace("theoremreach", "Theorem")
      .replace("TimeWall", "TimeWall").replace("timewall", "TimeWall");

  return (
    <div style={{ marginBottom: 32, marginTop: 4 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
        fontSize: 11, fontWeight: 800, fontFamily: "'Fredoka', sans-serif",
        color: "var(--text3)", letterSpacing: "0.09em", textTransform: "uppercase",
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "var(--green)", boxShadow: "0 0 6px rgba(47,163,111,0.36)",
          display: "inline-block", animation: "pulse 2s infinite",
        }} />
        Live Earns
      </div>
      <style>{`.live-strip::-webkit-scrollbar { display: none; }`}</style>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "row", alignItems: "center", gap: 10,
            background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "10px 14px", flex: "0 0 240px", minWidth: 0,
          }}>
            <img
              src={item.avatarUrl || "https://www.gravatar.com/avatar/?d=mp"}
              style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", flexShrink: 0, border: "2px solid var(--cheap)" }}
              onError={e => { e.target.src = "https://www.gravatar.com/avatar/?d=mp"; }}
            />
            <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <div style={{ fontWeight: 800, color: "var(--text)", fontFamily: "'Fredoka', sans-serif", fontSize: 13, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.displayName || item.username}
              </div>
              <div style={{ fontSize: 11, color: "var(--cheap)", fontWeight: 700, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {shortSource(item.source)}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
              <span style={{ color: "var(--green)", fontWeight: 900, fontFamily: "'Fredoka', sans-serif", fontSize: 16 }}>R$</span>
              <span style={{ color: "var(--text)", fontWeight: 800, fontFamily: "'Fredoka', sans-serif", fontSize: 16 }}>{item.tokens}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OfferBadge ───────────────────────────────────────────────────────────────
function OfferBadge({ text, bg, color }) {
  return (
    <div style={{
      position: "absolute", top: 12, right: 12,
      background: bg, color: color,
      fontSize: 11, fontWeight: 800, fontFamily: "'Fredoka', sans-serif",
      letterSpacing: "0.04em", padding: "4px 10px", borderRadius: 8,
      border: "1px solid " + color + "33", zIndex: 2, lineHeight: 1,
    }}>
      {text}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="section-header" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "var(--surface2)",
            border: "1px solid var(--border)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 18, flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
        <div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 1, lineHeight: 1.2 }}>
            {title}
          </div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 500, color: "var(--text2)" }}>
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SocialsTaskRow ───────────────────────────────────────────────────────────
function SocialsTaskRow({ loggedIn, userId, onClaim, openLoginModal }) {
  const [optimisticClaimed, setOptimisticClaimed] = useState([]);
  const [dbClaimed, setDbClaimed] = useState([]);
  const pending = useRef(new Set());

  useEffect(() => {
    if (!loggedIn || !userId) return;

    function fetchClaimed() {
      supabase
        .from("users")
        .select("completed_task_ids")
        .eq("user_id", userId)
        .single()
        .then(({ data }) => {
          if (!data) return;
          const ids = (data.completed_task_ids || [])
            .filter(id => id.startsWith("social_"))
            .map(id => id.replace("social_", ""));
          setDbClaimed(ids);
        });
    }

    fetchClaimed();

    const channel = supabase
      .channel("social-claimed-" + userId)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "users",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const ids = (payload.new.completed_task_ids || [])
          .filter(id => id.startsWith("social_"))
          .map(id => id.replace("social_", ""));
        setDbClaimed(ids);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loggedIn, userId]);

  const socials = [
    { key: "youtube",   label: "YouTube",   reward: "+2 Tokens", rewardNum: 2, icon: "/youtube.svg",   href: "https://youtube.com/@cheapdotgg",   bg: "linear-gradient(180deg, #ffe8f0 0%, #ffd9e8 100%)", border: "#efbfd2" },
    { key: "discord",   label: "Discord",   reward: "+1 Token",  rewardNum: 1, icon: "/discord.svg",   href: "https://discord.gg/MbUeMBPmzQ",     bg: "linear-gradient(180deg, #ebefff 0%, #dde5ff 100%)", border: "rgba(114,137,218,0.30)" },
    { key: "instagram", label: "Instagram", reward: "+1 Token",  rewardNum: 1, icon: "/instagram.svg", href: "https://instagram.com/cheapdotgg",  bg: "linear-gradient(180deg, #fff0f6 0%, #ffe3ef 100%)", border: "#efcfdd" },
    { key: "tiktok",    label: "TikTok",    reward: "+1 Token",  rewardNum: 1, icon: "/tiktok.svg",    href: "https://tiktok.com/@cheap_gg",    bg: "linear-gradient(180deg, #eef3f8 0%, #e0e8f1 100%)", border: "#ccd7e4" },
  ];

  return (
    <div className="socials-grid">
      {socials.map(s => {
        const isClaimed = dbClaimed.includes(s.key) || optimisticClaimed.includes(s.key);
        return (
          <a
            key={s.key}
            href={s.href}
            onClick={e => {
              if (!loggedIn) { e.preventDefault(); openLoginModal(); return; }
              if (isClaimed) {
                if (!pending.current.has("toast_" + s.key)) {
                  pending.current.add("toast_" + s.key);
                  onClaim(s, true);
                  setTimeout(() => pending.current.delete("toast_" + s.key), 2000);
                }
                return;
              }
              if (pending.current.has(s.key)) return;
              pending.current.add(s.key);
              setOptimisticClaimed(prev => [...prev, s.key]);
              onClaim(s, false).finally(() => pending.current.delete(s.key));
            }}
            target="_blank"
            rel="noopener noreferrer"
            className={"social-card " + s.key}
            style={{
              background: s.bg, border: "1.5px solid " + s.border,
              opacity: 1, cursor: "pointer",
              minHeight: 130, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              position: "relative", textDecoration: "none",
              borderRadius: 16, overflow: "hidden", transition: "transform 0.18s ease, filter 0.18s ease",
              boxShadow: "0 10px 24px rgba(76,88,110,0.08)",
            }}
            onMouseEnter={e => {
              if (!loggedIn) return;
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.filter = "brightness(1.06)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.filter = "brightness(1)";
            }}
          >
            <img src={s.icon} alt={s.label} style={{
              width: "auto", maxWidth: "75%", maxHeight: 65, height: "auto",
              objectFit: "contain", filter: "none",
            }} />
            <div className="social-reward">{isClaimed ? "Claimed" : s.reward}</div>
          </a>
        );
      })}
    </div>
  );
}

// ─── CPXWidget ────────────────────────────────────────────────────────────────
function CPXWidget({ userId, username }) {
  const containerRef = useRef(null);
  const [noSurveys, setNoSurveys] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setNoSurveys(false);

    const secureHash = md5(String(userId) + "-" + CPX_SECRET);

    // Inter font
    if (!document.getElementById("cpx-inter-font")) {
      const fontLink = document.createElement("link");
      fontLink.id = "cpx-inter-font";
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(fontLink);
    }

    const configScript = document.createElement("script");
    configScript.id = "cpx-config-script";
    configScript.innerHTML = `
      var cpx_script1 = {
        div_id: "cpx-fullscreen",
        theme_style: 1,
        order_by: 2,
        limit_surveys: 12
      };
      window.config = {
        general_config: {
          app_id: 33253,
          ext_user_id: "${userId}",
          username: "${username || ""}",
          email: "",
          secure_hash: "${secureHash}",
          subid_1: "",
          subid_2: ""
        },
        style_config: {
          text_color: "#1a1a2e",
          survey_box: {
            topbar_background_color: "#00ce98",
            box_background_color: "#ffffff",
            rounded_borders: true,
            stars_filled: "#FFD700"
          }
        },
        script_config: [cpx_script1],
        debug: false,
        functions: {
          no_surveys_available: function() {
            if (window.__cpxNoSurveysCallback) {
              window.__cpxNoSurveysCallback();
            }
          },
          count_new_surveys: function(count) {
            if (window.__cpxSurveyCountCallback) {
              window.__cpxSurveyCountCallback(count);
            }
          }
        }
      };
    `;

    let noSurveyTimer = null;

    window.__cpxNoSurveysCallback = () => {
      noSurveyTimer = setTimeout(() => setNoSurveys(true), 3000);
    };
    window.__cpxSurveyCountCallback = (count) => {
      if (count === 0) {
        noSurveyTimer = setTimeout(() => setNoSurveys(true), 3000);
      } else {
        clearTimeout(noSurveyTimer);
        setNoSurveys(false);
      }
    };

    const libScript = document.createElement("script");
    libScript.id = "cpx-lib-script";
    libScript.src = "https://cdn.cpx-research.com/assets/js/script_tag_v2.0.js";
    libScript.async = true;

    document.body.appendChild(configScript);
    document.body.appendChild(libScript);

    // MutationObserver — CPX popup DOM'a girince ortala
    const observer = new MutationObserver(() => {
      const popups = document.querySelectorAll(
        'body > [class*="cpx"], body > [id*="cpx"], body > [class*="survey"], body > [class*="modal"], body > [class*="overlay"]'
      );
      popups.forEach(el => {
        if (el.id === "cpx-fullscreen" || el.id === "cpx-widget-shell") return;
        el.style.position = "fixed";
        el.style.top = "50%";
        el.style.left = "50%";
        el.style.transform = "translate(-50%, -50%)";
        el.style.margin = "0";
        el.style.zIndex = "2147483647";
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Style overrides
    const styleOverride = document.createElement("style");
    styleOverride.id = "cpx-style-override";
    styleOverride.innerHTML = `
      /* Font */
      #cpx-fullscreen * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
      }

      /* Topbar */
      #cpx-fullscreen [class*="topbar"],
      #cpx-fullscreen [class*="header"] {
        background-color: #00ce98 !important;
      }

      /* Yıldızlar */
      #cpx-fullscreen [class*="star"] svg,
      #cpx-fullscreen [class*="star"] svg *,
      #cpx-fullscreen [class*="rating"] svg,
      #cpx-fullscreen [class*="rating"] svg * {
        fill: #FFD700 !important;
        color: #FFD700 !important;
        stroke: none !important;
      }
      #cpx-fullscreen [class*="star"],
      #cpx-fullscreen [class*="rating"] {
        color: #FFD700 !important;
      }

      /* Ödül / miktar rengi */
      #cpx-fullscreen [class*="reward"],
      #cpx-fullscreen [class*="amount"],
      #cpx-fullscreen [class*="price"],
      #cpx-fullscreen [class*="earn"] {
        color: #00ce98 !important;
        font-weight: 700 !important;
      }

      /* Ok */
      #cpx-fullscreen [class*="arrow"] {
        color: #00ce98 !important;
      }

      /* Başlık metinleri */
      #cpx-fullscreen h1,
      #cpx-fullscreen h2,
      #cpx-fullscreen h3,
      #cpx-fullscreen h4 {
        color: #1a1a2e !important;
      }

      /* Welcome banner stacking context'ini sıfırla */
      .welcome-banner,
      .banner-content,
      .banner-scene {
        z-index: unset !important;
      }

      /* Header ve sidebar popup'ın arkasında kalsın */
      .header,
      .chat-sidebar,
      .chat-sidebar-wrapper {
        z-index: 1 !important;
      }
    `;
    document.head.appendChild(styleOverride);

    return () => {
      observer.disconnect();
      clearTimeout(noSurveyTimer);
      delete window.__cpxNoSurveysCallback;
      delete window.__cpxSurveyCountCallback;
      document.getElementById("cpx-config-script")?.remove();
      document.getElementById("cpx-lib-script")?.remove();
      document.getElementById("cpx-style-override")?.remove();
      document.getElementById("cpx-fullscreen-wrapper")?.remove();
    };
  }, [userId, username]);

  return (
    <div
      id="cpx-widget-shell"
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: "72vh",
        background: "#ffffff",
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        isolation: "isolate",
      }}
    >
      {noSurveys && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 16, textAlign: "center",
          background: "#ffffff", padding: "40px 24px",
        }}>
          <div style={{ fontSize: 52 }}>😔</div>
          <div style={{
            fontFamily: "'Fredoka', sans-serif", fontSize: 22,
            fontWeight: 900, color: "#1a1a2e",
          }}>
            No surveys available
          </div>
          <div style={{
            fontFamily: "'Fredoka', sans-serif", fontSize: 14,
            fontWeight: 500, color: "#555", maxWidth: 320, lineHeight: 1.7,
          }}>
            There are no surveys available for you right now. Please check back later — new surveys are added regularly!
          </div>
        </div>
      )}
      <div
        id="cpx-fullscreen"
        style={{ maxWidth: "950px", margin: "0 auto" }}
      />
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export function HomePage() {
  const {
    loggedIn, openLoginModal, displayName, username,
    userId, avatarUrl, tokens, tasksCompleted, refreshUser,
  } = useApp();

  const [activeOffer, setActiveOffer] = useState(null);
  const [trUrl, setTrUrl]             = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [toasts, setToasts]           = useState([]);
  const toastCounter                  = useRef(0);

  function addToast(text, type = "success") {
    const id = ++toastCounter.current;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 3500);
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  async function handleSocialClaim(social, alreadyClaimed = false) {
    if (alreadyClaimed) {
      addToast(`You've already claimed ${social.label}!`, "already");
      return;
    }
    const taskId = `social_${social.key}`;
    try {
      const { data: user, error: fetchErr } = await supabase
        .from("users")
        .select("balance, tasks_completed, completed_task_ids")
        .eq("user_id", userId)
        .single();

      if (fetchErr || !user) return;
      if ((user.completed_task_ids || []).includes(taskId)) {
        addToast(`You've already claimed ${social.label}!`, "already");
        return;
      }

      await supabase
        .from("users")
        .update({
          balance: (user.balance || 0) + social.rewardNum,
          tasks_completed: (user.tasks_completed || 0) + 1,
          completed_task_ids: [...(user.completed_task_ids || []), taskId],
        })
        .eq("user_id", userId);

      addToast(`Successfully claimed ${social.reward}!`, "success");
      if (typeof refreshUser === "function") refreshUser();
    } catch (e) {
      console.error(e);
    }
  }

  const OFFER_LABELS = {
    cpx: "CPX Research", bitlabs: "Bitlabs", tr: "TheoremReach",
  };

  async function checkVpnAndOpen(openFn) {
    try {
      const res  = await fetch("/api/check-ip");
      const data = await res.json();
      if (data.blocked) { setActiveOffer("vpn"); return; }
    } catch (e) {}
    openFn();
  }

  const offerCards = [
    {
      key: "cpx", bg: "#00ce98", border: "transparent",
      logo: "/cpx-research.svg", logoFilter: "brightness(0) invert(1)",
      badge: "BEST", badgeBg: "rgba(0,0,0,0.25)", badgeColor: "#ffffff",
      onClick: () => checkVpnAndOpen(() => setActiveOffer("cpx")),
      logoHeight: 55, padding: "8px 16px",
    },
    {
      key: "bitlabs", bg: "#ffffff", border: "transparent",
      logo: "/bitlabs.svg", logoFilter: "none",
      badge: "+50%", badgeBg: "rgba(0,0,0,0.25)", badgeColor: "#ffffff",
      onClick: () => checkVpnAndOpen(() => setActiveOffer("bitlabs")),
      logoHeight: 80, padding: "14px 16px",
    },
    {
      key: "tr", bg: "#3f1f8d", border: "transparent",
      logo: "/theoremreach.svg", logoFilter: "none",
      badge: "HOT 🔥", badgeBg: "rgba(0,0,0,0.25)", badgeColor: "#c4a7ff",
      onClick: () => checkVpnAndOpen(async () => {
        const res  = await fetch("/api/theoremreach-entry?user_id=" + userId);
        const data = await res.json();
        setTrUrl(data.url);
        setActiveOffer("tr");
      }),
      logoHeight: 55, padding: "14px 16px",
    },
    {
      key: "timewall", bg: "#4cbb6e", border: "2px solid rgba(0,0,0,0.10)",
      logo: "/timewall.svg", logoFilter: "none",
      badge: "NEW", badgeBg: "rgba(0,0,0,0.20)", badgeColor: "#ffffff",
      onClick: () => checkVpnAndOpen(() => setActiveOffer("timewall")),
      logoHeight: 52, padding: "14px 16px",
    },
  ];

  return (
    <div>
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      {loggedIn ? (
        <div className="welcome-banner" style={{ marginTop: 24 }}>
          <div className="banner-scene" />
          <div className="banner-content">
            <div className="banner-profile-wrap">
              <AvatarFrame
                src={avatarUrl} size={88}
                onError={e => { e.target.src = "https://www.gravatar.com/avatar/?d=mp"; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="banner-user-name">{displayName}</div>
                <div className="banner-user-id">@{username} · ID {userId}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }} className="banner-stats">
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "transparent", borderRadius: 10, padding: "9px 16px",
                    border: "1.5px solid rgba(245,166,35,0.5)",
                  }} className="banner-stat">
                    <TokenCoin size={24} />
                    <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text)", whiteSpace: "nowrap" }}>
                      {typeof tokens === "number" ? tokens.toLocaleString() : tokens} Tokens
                    </span>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "transparent", borderRadius: 10, padding: "9px 16px",
                    border: "1.5px solid rgba(245,166,35,0.5)",
                  }} className="banner-stat">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text)", whiteSpace: "nowrap" }}>
                      {tasksCompleted} Tasks done
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="welcome-banner" style={{ marginTop: 24, padding: "40px 0" }}>
          <div className="banner-scene" />
          <div className="banner-content" style={{ flexDirection: "column", gap: 22, alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%" }}>
            <img src="/headerlogo.webp" alt="cheap.gg" style={{ height: 100, width: "auto", objectFit: "contain", maxHeight: "clamp(48px, 12vw, 100px)" }} />
            <button type="button" onClick={openLoginModal} className="banner-login-btn">Login</button>
          </div>
        </div>
      )}

      <LiveEarningsStrip />

      {/* ── Offers ── */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeader
          icon={null}
          title="Offers"
          subtitle={loggedIn ? "Complete surveys & offers to earn tokens" : "Sign in to see available offers"}
        />
        {loggedIn && activeOffer ? (
            <div style={{ marginTop: 16 }}>
              {activeOffer === "vpn" ? (
                <div style={{
                  border: "1px solid rgba(255,90,90,0.30)", borderRadius: 14,
                  padding: "52px 32px", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 16, textAlign: "center", background: "rgba(255,90,90,0.04)",
                }}>
                  <div style={{ fontSize: 48 }}>🚫</div>
                  <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text)" }}>
                    VPN / Proxy Detected
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500, lineHeight: 1.7, maxWidth: 360, margin: 0 }}>
                    Please disable your VPN or proxy to access offers. This is required by our providers to prevent fraud.
                  </p>
                  <button type="button" onClick={() => setActiveOffer(null)} style={{
                    marginTop: 8, display: "flex", alignItems: "center", gap: 7,
                    background: "rgba(255,90,90,0.10)", border: "1px solid rgba(255,90,90,0.30)",
                    color: "var(--red)", borderRadius: 9, padding: "10px 24px", cursor: "pointer",
                    fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 800,
                  }}>
                    ← Go Back
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <button type="button" onClick={() => setActiveOffer(null)} style={{
                      display: "flex", alignItems: "center", gap: 7,
                      background: "var(--surface2)", border: "1px solid var(--border)",
                      color: "var(--text)", borderRadius: 9, padding: "8px 16px", cursor: "pointer",
                      fontFamily: "'Fredoka', sans-serif", fontSize: 13, fontWeight: 800,
                    }}>
                      ← Go Back
                    </button>
                    <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
                      {OFFER_LABELS[activeOffer] || ""}
                    </span>
                    <div style={{ width: 90 }} />
                  </div>

                  {activeOffer === "timewall" ? (
                    <div style={{
                      background: "var(--surface2)", border: "1px solid var(--border)",
                      borderRadius: 14, display: "flex", flexDirection: "column",
                      alignItems: "center", padding: "36px 24px", gap: 28, textAlign: "center",
                    }}>
                      <div style={{
                        background: "rgba(76,187,110,0.08)", border: "1.5px solid rgba(76,187,110,0.30)",
                        borderRadius: 14, padding: "20px 28px", maxWidth: 500, width: "100%",
                      }}>
                        <div style={{
                          fontFamily: "'Fredoka', sans-serif", fontSize: 20, fontWeight: 900,
                          color: "#4cbb6e", marginBottom: 10,
                        }}>
                          ⚠️ Don't forget to redeem your reward!
                        </div>
                        <div style={{
                          fontFamily: "'Fredoka', sans-serif", fontSize: 14, fontWeight: 600,
                          color: "var(--text2)", lineHeight: 1.7,
                        }}>
                          After completing an offer on TimeWall, go to{" "}
                          <span style={{ color: "#4cbb6e", fontWeight: 900 }}>Account → Redeem</span>
                          {" "}to send your tokens to your cheap.gg balance.
                          Without redeeming, your tokens will stay on TimeWall and{" "}
                          <span style={{ color: "var(--text)", fontWeight: 800 }}>won't appear here.</span>
                        </div>
                      </div>
                      <a
                        href={`https://timewall.io/users/login?oid=${TIMEWALL_OID}&uid=${userId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "'Fredoka', sans-serif", fontSize: 16, fontWeight: 900,
                          padding: "14px 48px", borderRadius: 12,
                          background: "#4cbb6e", color: "#fff",
                          textDecoration: "none", display: "inline-block",
                          boxShadow: "0 10px 26px rgba(76,187,110,0.28)",
                          transition: "filter 0.15s ease",
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
                        onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
                      >
                        Open TimeWall →
                      </a>
                      <img
                        src="/timewallpopup.webp"
                        alt="How to redeem on TimeWall"
                        style={{
                          maxWidth: "100%", width: 300, height: "auto",
                          borderRadius: 14, border: "1.5px solid rgba(76,187,110,0.20)",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ borderRadius: 14, overflow: "hidden", minHeight: 480 }}>
                      {activeOffer === "cpx" && (
                        <CPXWidget userId={userId} username={username} />
                      )}
                      {activeOffer === "bitlabs" && (
                        <iframe
                          style={{ width: "100%", height: "72vh", minHeight: 480, border: 0 }}
                          title="Bitlabs"
                          src={"https://web.bitlabs.ai/?uid=" + userId + "&token=" + BITLABS_APP_TOKEN}
                        />
                      )}
                      {activeOffer === "tr" && trUrl && (
                        <iframe
                          style={{ width: "100%", height: "72vh", minHeight: 480, border: 0 }}
                          title="TheoremReach"
                          src={trUrl}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="offers-grid">
              {offerCards.map(card => (
                <button
                  key={card.key} type="button" className={"offer-card " + card.key}
                  onClick={() => { if (!loggedIn) { openLoginModal(); return; } card.onClick(); }}
                  onMouseEnter={() => setHoveredCard(card.key)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: card.bg, backgroundColor: card.bg, border: "1.5px solid " + card.border,
                    borderRadius: 18, padding: card.padding, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: 130, position: "relative", overflow: "hidden",
                    transition: "transform 0.18s ease, box-shadow 0.22s ease, filter 0.18s ease",
                    boxSizing: "border-box",
                    transform: hoveredCard === card.key ? "translateY(-4px) scale(1.02)" : "none",
                    boxShadow: hoveredCard === card.key ? "0 18px 34px rgba(76,88,110,0.16)" : "0 8px 18px rgba(76,88,110,0.10)",
                    filter: hoveredCard === card.key ? "brightness(1.08)" : "brightness(1)",
                  }}
                >
                  <OfferBadge text={card.badge} bg={card.badgeBg} color={card.badgeColor} />
                  {hoveredCard === card.key && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
                      pointerEvents: "none",
                    }} />
                  )}
                  {card.logo && (
                    <img src={card.logo} alt={card.key} style={{
                      width: "auto", height: card.logoHeight, maxWidth: "80%",
                      objectFit: "contain", display: "block",
                      filter: card.logoFilter, position: "relative", zIndex: 1,
                    }} />
                  )}
                </button>
              ))}
            </div>
          )}
      </div>

      {/* ── Socials ── */}
      <div style={{ marginBottom: 52, marginTop: 16 }}>
        <SectionHeader
          icon={null}
          title="Socials"
          subtitle={loggedIn ? "Follow our social media accounts for some free Coins!" : "Sign in to start earning tokens"}
        />
        <SocialsTaskRow loggedIn={loggedIn} userId={userId} onClaim={handleSocialClaim} openLoginModal={openLoginModal} />
      </div>

      <footer className="footer">
        <Logo />
        <div>
          <a href="/faq">FAQ</a>
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>© 2025 cheap.gg</div>
      </footer>
    </div>
  );
}

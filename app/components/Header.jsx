"use client";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { useRouter, usePathname } from "next/navigation";
import { NAV_ITEMS, NAV_LABELS, NAV_ICONS } from "@/lib/constants";

export default function Header() {
  const { loggedIn, tokens, avatarUrl, isAdmin, openLoginModal, openRedeemModal, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [...NAV_ITEMS, ...(isAdmin ? ["admin"] : [])];

  useEffect(() => {
    function updateHeight() {
      const h = headerRef.current?.offsetHeight;
      if (h) document.documentElement.style.setProperty("--header-h", h + "px");
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [loggedIn, menuOpen]);

  useEffect(() => {
    function onOutside(e) {
      if (!headerRef.current?.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  function getPath(item) {
    if (item === "home") return "/";
    if (item === "admin") return "/admin";
    return `/${item}`;
  }
  function isActive(item) { return pathname === getPath(item); }

  function onNavClick(item) {
    setMenuOpen(false);
    if (item === "redeem") {
      if (!loggedIn) { openLoginModal(); return; }
      openRedeemModal();
      return;
    }
    router.push(getPath(item));
  }

  return (
    <header className="header" ref={headerRef}>
      <div className="header-inner">

        {/* SOL — Logo */}
        <div className="header-left">
          <img
            src="/headerlogo.webp"
            className="header-logo-img"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/")}
            alt="cheap.gg"
          />
        </div>

        {/* ORTA — Desktop nav */}
        <div className="header-center">
          <nav className="nav" style={{ width: "100%", justifyContent: "space-evenly", gap: 0 }}>
            {navItems.map(item => (
              <button
                key={item}
                className={`nav-btn${isActive(item) ? " active" : ""}${item === "admin" ? " admin-tab" : ""}`}
                onClick={() => onNavClick(item)}
                type="button"
              >
                {NAV_ICONS[item] && <img src={NAV_ICONS[item]} alt="" style={{ width: 20, height: 20 }} />}
                <span>{item === "admin" ? NAV_LABELS.admin : NAV_LABELS[item]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* SAĞ — Token / Avatar / Giriş + Burger */}
        <div className="header-right">
          {loggedIn ? (
            <>
              <div className="token-chip">
                <img src="/icons/token.webp" style={{ width: 22, height: 22 }} alt="" />
                <span>{tokens.toLocaleString()}</span>
              </div>
              <div
                className="avatar-btn"
                onClick={() => router.push("/profile")}
                role="button"
                tabIndex={0}
              >
                <img
                  src={avatarUrl}
                  alt="avatar"
                  onError={e => { e.target.src = "https://www.gravatar.com/avatar/?d=mp"; }}
                />
              </div>
            </>
          ) : (
            <button
              type="button"
              className="btn-amber header-signin-btn"
              onClick={openLoginModal}
            >
              Sign in with Roblox
            </button>
          )}

          <button
            className="burger-btn"
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menü aç/kapat"
          >
            <span className={`burger-icon${menuOpen ? " open" : ""}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {navItems.map(item => (
          <button
            key={item}
            className={`mobile-menu-item${isActive(item) ? " active" : ""}${item === "admin" ? " admin-tab" : ""}`}
            onClick={() => onNavClick(item)}
            type="button"
          >
            {NAV_ICONS[item] && <img src={NAV_ICONS[item]} alt="" />}
            <span>{item === "admin" ? NAV_LABELS.admin : NAV_LABELS[item]}</span>
          </button>
        ))}
        {loggedIn && (
          <button
            className="mobile-menu-item mobile-menu-logout"
            type="button"
            onClick={() => { setMenuOpen(false); logout(); }}
          >
            <span>Log out</span>
          </button>
        )}
      </div>
    </header>
  );
}
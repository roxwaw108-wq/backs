"use client";

// ─── TOKEN COIN ───────────────────────────────────────────────────────────────
export function TokenCoin({ size = 18 }) {
  return (
    <img src="/icons/token.webp" alt="" style={{ width: size, height: size, flexShrink: 0, objectFit: "contain", display: "block" }} />
  );
}

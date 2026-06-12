"use client";
import { useState } from "react";

export function getClaimImageSrc(itemImg) {
  if (!itemImg) return null;
  if (itemImg.startsWith("/") || itemImg.startsWith("http")) return itemImg;
  if (itemImg.includes(".")) return `/icons/${itemImg}`;
  return null;
}

const placeholderStyle = (size, extra) => ({
  width: size,
  height: size,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: Math.round(size * 0.45),
  flexShrink: 0,
  background: "var(--surface2)",
  borderRadius: 8,
  border: "1px solid var(--border)",
  ...extra,
});

export function ClaimItemImage({ itemImg, itemName, size = 64, style }) {
  const [failed, setFailed] = useState(false);
  const src = getClaimImageSrc(itemImg);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        style={{ width: size, height: size, objectFit: "contain", borderRadius: 8, flexShrink: 0, display: "block", ...style }}
        onError={() => setFailed(true)}
      />
    );
  }

  return <div style={placeholderStyle(size, style)} aria-hidden>💎</div>;
}

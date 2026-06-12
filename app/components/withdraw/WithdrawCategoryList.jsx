"use client";
import Image from "next/image";
import { WITHDRAW_CATEGORIES } from "@/lib/constants";

export function WithdrawCategoryList({ loggedIn, onSelect }) {
  if (!loggedIn) return null;

  return (
    <div className="offers-grid">
      {WITHDRAW_CATEGORIES.map(cat => (
        <div
          key={cat.id}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 18,
            overflow: "hidden",
            cursor: "pointer",
            backgroundColor: "#1a1a1a",
          }}
          onClick={() => onSelect(cat.id)}
        >
          <Image
            src={cat.image}
            alt={cat.label ?? cat.id}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
            zIndex: 1,
          }} />
        </div>
      ))}
    </div>
  );
}
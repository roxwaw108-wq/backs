"use client";
import { useState, useEffect } from "react";
import { TokenCoin } from "../ui/TokenCoin";
import { AdoptMeBadges } from "../ui/AdoptMeBadges";

export function StockPanel({ cat, tokens, avatarUrl, displayName, username, setBuyModal, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/items?category=${cat.id}`)
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cat.id]);

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "var(--text2)",
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          padding: 0,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        ← Back
      </button>

      <div
        className="card"
        style={{
          padding: "16px 22px",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <img
          src={avatarUrl}
          style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid var(--border)" }}
          onError={e => { e.target.src = "https://www.gravatar.com/avatar/?d=mp"; }}
          alt="avatar"
        />
        <div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 900, fontSize: 14, color: "var(--text)" }}>
            {displayName}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>@{username}</div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 900,
            fontSize: 16,
            color: "var(--cheap)",
          }}
        >
          <TokenCoin size={18} />{tokens.toLocaleString()} tokens
        </div>
      </div>

      <div
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 18,
          fontWeight: 900,
          color: "var(--text)",
          marginBottom: 14,
        }}
      >
        Available Items
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>Loading items...</div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>
          No items in this category yet.
        </div>
      ) : (
        <>
          <style>{`
            .stock-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
              gap: 16px;
            }
            @media (max-width: 480px) {
              .stock-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
          `}</style>
          <div className="stock-grid">
            {items.map(item => {
              const canAfford = tokens >= item.cost;
              return (
                <div
                  key={item._id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "20px 16px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                    textAlign: "center",
                    transition: "transform .18s, border-color .18s, box-shadow .18s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = "var(--cheap)";
                    e.currentTarget.style.boxShadow = "0 12px 26px rgba(229,106,162,0.12)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 4,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={`/icons/${item.image}`}
                      alt={item.name}
                      style={{ width: "85%", height: "85%", objectFit: "contain" }}
                    />
                    <AdoptMeBadges badges={item.badges || []} />
                  </div>

                  <div
                    style={{
                      fontFamily: "'Fredoka', sans-serif",
                      fontWeight: 800,
                      fontSize: 14,
                      color: "var(--text)",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.name}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 20,
                      fontFamily: "'Fredoka', sans-serif",
                      fontWeight: 900,
                      color: "var(--text)",
                    }}
                  >
                    <TokenCoin size={18} />
                    {item.cost.toLocaleString()}
                  </div>

                  <button
                    onClick={() => setBuyModal({ item, cat })}
                    style={{
                      width: "100%",
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: 14,
                      fontWeight: 800,
                      background: "var(--cheap)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 0",
                      cursor: "pointer",
                      transition: "background .15s, transform .1s",
                      marginTop: 2,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "var(--cheap-bright)";
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "var(--cheap)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

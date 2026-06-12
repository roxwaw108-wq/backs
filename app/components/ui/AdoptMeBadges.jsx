const AM_BADGES = [
  { id: "mega", label: "M", file: "mega.webp" },
  { id: "neon", label: "N", file: "neon.webp" },
  { id: "fly",  label: "F", file: "fly.webp"  },
  { id: "ride", label: "R", file: "ride.webp" },
];

export function AdoptMeBadges({ badges = [] }) {
  const active = AM_BADGES.filter(b => badges.includes(b.id));
  if (active.length === 0) return null;
  return (
    <div style={{
      position: "absolute", bottom: 3, right: 3,
      display: "flex", gap: 1, alignItems: "center",
    }}>
      {active.map(b => (
        <img
          key={b.id}
          src={`/icons/${b.file}`}
          alt={b.label}
          style={{ width: 23, height: 23, objectFit: "contain" }}
        />
      ))}
    </div>
  );
}
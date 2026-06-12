import { TIER_ICONS } from "@/lib/level";

export default function TierIcon({ iconKey, color, glow, size = 14 }) {
  if (!iconKey) return null;
  const icon = TIER_ICONS[iconKey];
  if (!icon) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        flexShrink: 0,
        filter: `drop-shadow(0 0 3px ${glow})`,
      }}
    >
      {icon.paths.map((d, i) => (
        <path key={i} fill={color} d={d} />
      ))}
    </svg>
  );
}

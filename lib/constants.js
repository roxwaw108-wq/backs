export const API = "/api";

const envAdminUsers = process.env.NEXT_PUBLIC_ADMIN_USERS || process.env.ADMIN_USERS;
export const ADMIN_USERS = (envAdminUsers || "aldreanlove,mllyoner")
  .split(",")
  .map(user => user.trim())
  .filter(Boolean);

export const WITHDRAW_CATEGORIES = [
  { id: "robux",    image: "/icons/robux.webp",    label: "Robux",        accent: "#f5a623" },
  { id: "giftcard", image: "/icons/giftcard.webp", label: "Gift Cards",   accent: "#4caf50" },
  { id: "adoptme",  image: "/icons/adoptme.webp",  label: "Adopt Me!",    accent: "#e91e8c" },
  { id: "mm2",      image: "/icons/mm2.webp",      label: "Murder Mystery 2", accent: "#e53935" },
  { id: "limiteds",   image: "/icons/limiteds.webp",   label: "Limiteds",    accent: "#78d4f8" },
];

export const DEFAULT_TASKS = [
  { id: "youtube", icon: "/icons/youtube.svg", title: "YouTube", reward: 2, color: "#FF0000", link: "https://youtube.com/@cheapgg", visited: false, claimed: false, buttonText: "Subscribe" },
  { id: "tiktok", icon: "/icons/tiktok.svg", title: "TikTok", reward: 1, color: "#00F2EA", link: "https://tiktok.com/@cheapgg", visited: false, claimed: false, buttonText: "Follow" },
  { id: "instagram", icon: "/icons/instagram.svg", title: "Instagram", reward: 1, color: "#E1306C", link: "https://www.instagram.com/cheapgg/", visited: false, claimed: false, buttonText: "Follow" },
  { id: "discord", icon: "/icons/discord.svg", title: "Discord", reward: 1, color: "#5865F2", link: "https://discord.gg/cheapgg", visited: false, claimed: false, buttonText: "Join" },
];

export const NAV_ITEMS = ["home", "withdraw", "claims", "affiliate", "redeem", "support"];
export const NAV_LABELS = { home: "Home", withdraw: "Withdraw", claims: "Claims", affiliate: "Affiliate", redeem: "Redeem", support: "Support", faq: "FAQ", admin: "⚡ Admin" };
/** Aktif promosyon kodları: kod → ödül (token) */
export const VALID_PROMO_CODES = {
  FREE5: { reward: 5 },
};

/** Süresi dolmuş kodlar (şimdilik boş) */
export const EXPIRED_PROMO_CODES = [];

export const NAV_ICONS = {
  home: "/icons/home.png",
  withdraw: "/icons/withdraw.png",
  claims: "/icons/claims.png",
  affiliate: "/icons/affiliate.png",
  redeem: "/icons/redeem.png",
  support: "/icons/support.png",
};
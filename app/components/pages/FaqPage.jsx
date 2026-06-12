"use client";

export function FaqPage() {
  const faqs = [
    { q: "How do I earn tokens?", a: "Complete tasks like playing games, inviting friends, and sharing on social media to earn tokens." },
    { q: "How long does withdrawal take?", a: "Robux withdrawal requests are processed within 24–48 hours." },
    { q: "What is the minimum withdrawal?", a: "The minimum withdrawal amount is 15 Robux." },
    { q: "Is it free to sign up?", a: "Yes! Signing up is completely free. No password needed — verification is done via your Roblox bio." },
    { q: "How do I claim my items?", a: "After purchasing an item, go to the Claims page and chat with a moderator. They will deliver your item directly." },
    { q: "How does the affiliate system work?", a: "Share your unique referral link. You earn 10% of the tokens earned by everyone who signs up through your link." },
    { q: "How do I redeem a code?", a: "Click Redeem in the navigation bar, enter your code in the popup, and tokens will be added instantly." },
  ];

  return (
    <div style={{ paddingTop: 40 }}>
      <div className="page-title">FAQ</div>
      <p className="page-sub">Frequently asked questions</p>
      {faqs.map((item, i) => (
        <div key={i} className="card" style={{ padding: "20px 24px", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>{item.q}</div>
          <div style={{ fontSize: 14, color: "var(--text2)", fontWeight: 500, lineHeight: 1.6 }}>{item.a}</div>
        </div>
      ))}
    </div>
  );
}
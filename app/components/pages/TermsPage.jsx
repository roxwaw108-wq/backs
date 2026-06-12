"use client";
export function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      body: "By accessing or using cheap.gg, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform."
    },
    {
      title: "2. Account & Verification",
      body: "cheap.gg uses Roblox account verification. You are responsible for keeping your account secure. We are not responsible for any unauthorized access to your account."
    },
    {
      title: "3. Tokens",
      body: "Tokens are virtual points earned by completing tasks and offers on cheap.gg. Tokens can be redeemed for in-game items and rewards as listed on the platform. Tokens have no cash value, are non-transferable, and may not be sold or traded. cheap.gg is not affiliated with or endorsed by Roblox Corporation."
    },
    {
      title: "4. Withdrawals",
      body: "Withdrawal requests are processed at our discretion. We reserve the right to delay, cancel, or deny any withdrawal if we suspect fraudulent activity or a violation of these terms."
    },
    {
      title: "5. Prohibited Conduct",
      body: "You may not use bots, scripts, or any automated tools to earn tokens. You may not create multiple accounts. You may not abuse referral systems or redeem codes in bad faith. Violation of these rules will result in permanent account termination and forfeiture of all tokens."
    },
    {
      title: "6. Modifications to the Service",
      body: "We reserve the right to modify, suspend, or discontinue cheap.gg at any time without notice. We are not liable to you or any third party for any such changes."
    },
    {
      title: "7. Limitation of Liability",
      body: "cheap.gg is provided 'as is' without any warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform."
    },
    {
      title: "8. Changes to Terms",
      body: "We may update these Terms of Service at any time. Continued use of the platform after changes constitutes your acceptance of the new terms."
    },
    {
      title: "9. Contact",
      body: "If you have any questions about these terms, please contact us via the Support page."
    },
  ];

  return (
    <div style={{ paddingTop: 40 }}>
      <div className="page-title">Terms of Service</div>
      <p className="page-sub">Last updated: June 2026</p>
      {sections.map((s, i) => (
        <div key={i} className="card" style={{ padding: "20px 24px", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>{s.title}</div>
          <div style={{ fontSize: 14, color: "var(--text2)", fontWeight: 500, lineHeight: 1.6 }}>{s.body}</div>
        </div>
      ))}
    </div>
  );
}
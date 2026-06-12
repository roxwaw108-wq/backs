"use client";
export function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      body: "When you sign in with Roblox, we collect your Roblox username, display name, and user ID. We do not collect email addresses, passwords, or any other personal information. We also track activity on the platform such as tasks completed, tokens earned, and withdrawal requests."
    },
    {
      title: "2. How We Use Your Information",
      body: "We use your information to operate the platform, process withdrawals, prevent fraud, and improve our services. We do not sell your data to third parties."
    },
    {
      title: "3. Cookies & Local Storage",
      body: "cheap.gg uses browser local storage to keep you logged in between sessions. We may also use cookies for referral tracking. You can clear your browser data at any time to remove this information."
    },
    {
      title: "4. Third-Party Services",
      body: "cheap.gg integrates third-party offer providers such as CPX Research, Bitlabs, and TheoremReach. These services have their own privacy policies and may collect additional data when you interact with their offers."
    },
    {
      title: "5. Data Retention",
      body: "We retain your account data for as long as your account is active. If you wish to have your data removed, please contact us via the Support page."
    },
    {
      title: "6. Security",
      body: "We take reasonable technical measures to protect your data. However, no system is 100% secure and we cannot guarantee absolute security of your information."
    },
    {
      title: "7. Changes to This Policy",
      body: "We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the date at the top of this page."
    },
    {
      title: "8. Contact",
      body: "If you have any questions about this Privacy Policy, please reach out via the Support page."
    },
  ];

  return (
    <div style={{ paddingTop: 40 }}>
      <div className="page-title">Privacy Policy</div>
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
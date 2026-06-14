"use client";
import { useApp } from "../../context/AppContext";
import { WITHDRAW_CATEGORIES } from "@/lib/constants";
import { WithdrawCategoryList } from "../withdraw/WithdrawCategoryList";
import { RobuxPanel } from "../withdraw/RobuxPanel";
import { StockPanel } from "../withdraw/StockPanel";

export function WithdrawPage() {
  const {
    loggedIn, openLoginModal, withdrawCategory, setWithdrawCategory,
    tokens, setTokens, userId, username, displayName, avatarUrl,
    robuxRequests, setRobuxRequests, tasks, tasksCompleted, affiliateCode, saveSession, setBuyModal,
    sessionToken,
  } = useApp();

  const currentWithdrawCat = WITHDRAW_CATEGORIES.find(c => c.id === withdrawCategory);

  return (
    <div style={{ paddingTop: 40 }}>
      <div className="page-title">Withdraw</div>
      <p className="page-sub">Choose a reward category</p>

      {!loggedIn && (
        <div style={{
          marginBottom: 24,
          padding: "14px 18px",
          background: "rgba(245,166,35,0.08)",
          border: "1px solid rgba(245,166,35,0.30)",
          borderRadius: 12,
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <span>
            <span
              onClick={openLoginModal}
              style={{ color: "var(--cheap)", fontWeight: 800, cursor: "pointer", textDecoration: "underline" }}
            >
              Sign in
            </span>
            {" "}to withdraw your tokens for real rewards.
          </span>
        </div>
      )}

      {!withdrawCategory && (
        <WithdrawCategoryList
          loggedIn={loggedIn}
          onSelect={(cat) => {
            if (!loggedIn) { openLoginModal(); return; }
            setWithdrawCategory(cat);
          }}
        />
      )}

      {withdrawCategory === "robux" && loggedIn && (
        <RobuxPanel
          tokens={tokens} setTokens={setTokens} userId={userId} username={username}
          displayName={displayName} avatarUrl={avatarUrl} robuxRequests={robuxRequests}
          setRobuxRequests={setRobuxRequests} tasks={tasks} tasksCompleted={tasksCompleted}
          affiliateCode={affiliateCode} saveSession={saveSession} onBack={() => setWithdrawCategory(null)}
          sessionToken={sessionToken}
        />
      )}

      {withdrawCategory && withdrawCategory !== "robux" && currentWithdrawCat && loggedIn && (
        <StockPanel
          cat={currentWithdrawCat} tokens={tokens} avatarUrl={avatarUrl}
          displayName={displayName} username={username} setBuyModal={setBuyModal}
          onBack={() => setWithdrawCategory(null)}
        />
      )}
    </div>
  );
}
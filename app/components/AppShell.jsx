"use client";
import { useState } from "react";
import Header from "./Header";
import { ChatSidebar } from "./ChatSidebar";
import { AppModals } from "./AppModals";

export function AppShell({ children, showChat = true }) {
  const [chatOpen, setChatOpen] = useState(false);

  if (!showChat) {
    return (
      <>
        <Header />
        <div style={{ paddingTop: "var(--header-h, 54px)" }}>
          {children}
        </div>
        <AppModals />
      </>
    );
  }

  return (
    <>
      <Header />

      {chatOpen && (
        <div
          className="chat-mobile-overlay"
          onClick={() => setChatOpen(false)}
        />
      )}

      <div className="app-layout" style={{ paddingTop: "var(--header-h, 54px)" }}>
        <div className={`chat-sidebar-wrapper${chatOpen ? " mobile-open" : ""}`}>
          <ChatSidebar />
        </div>

        <div className="main-content">
          <div className="page-wrap">{children}</div>
        </div>
      </div>

      <button
        className="chat-toggle-btn"
        onClick={() => setChatOpen(v => !v)}
        aria-label="Chat aç/kapat"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      <AppModals />
    </>
  );
}
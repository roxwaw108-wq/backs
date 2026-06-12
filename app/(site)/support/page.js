"use client";
import { useApp } from "../../context/AppContext";
import { SupportPage } from "../../components/support/SupportPage";

export default function Page() {
  const app = useApp();
  return (
    <SupportPage
      loggedIn={app.loggedIn}
      openModal={app.openLoginModal}
      supportReason={app.supportReason}
      setSupportReason={app.setSupportReason}
      supportDesc={app.supportDesc}
      setSupportDesc={app.setSupportDesc}
      supportLoading={app.supportLoading}
      supportMsg={app.supportMsg}
      supportError={app.supportError}
      submitSupport={app.submitSupport}
      conversations={app.conversations}
      openSupportChat={t => app.setSupportChatTicket(t)}
    />
  );
}

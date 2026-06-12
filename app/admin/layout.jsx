"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/AppShell";
import { useApp } from "../context/AppContext";

export default function AdminLayout({ children }) {
  const { isAdmin, loggedIn, openLoginModal } = useApp();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!loggedIn) openLoginModal();
    else if (!isAdmin) router.replace("/");
  }, [ready, loggedIn, isAdmin, openLoginModal, router]);

  if (!ready || !isAdmin) return null;

  return <AppShell showChat={false}>{children}</AppShell>;
}
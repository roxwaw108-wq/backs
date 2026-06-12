"use client";
import { AppShell } from "../components/AppShell";

export default function SiteLayout({ children }) {
  return <AppShell showChat>{children}</AppShell>;
}

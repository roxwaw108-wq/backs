import { PrivacyPage } from "../../components/pages/PrivacyPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Cheap.gg handles your data and privacy.",
  alternates: { canonical: "https://cheap.gg/privacy" },
  openGraph: {
    url: "https://cheap.gg/privacy",
    title: "Privacy Policy | Cheap.gg",
    description: "Learn how Cheap.gg handles your data and privacy.",
  },
};

export default function Page() { return <PrivacyPage />; }
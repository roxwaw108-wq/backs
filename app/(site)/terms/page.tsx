import { TermsPage } from "../../components/pages/TermsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the official terms of service for Cheap.gg.",
  alternates: { canonical: "https://cheap.gg/terms" },
  openGraph: {
    url: "https://cheap.gg/terms",
    title: "Terms of Service | Cheap.gg",
    description: "Read the official terms of service for Cheap.gg.",
  },
};

export default function Page() { return <TermsPage />; }
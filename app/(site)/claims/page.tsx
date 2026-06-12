import { ClaimsPage } from "../../components/pages/ClaimsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Claims",
  description: "View and track your reward claims on Cheap.gg.",
  alternates: { canonical: "https://cheap.gg/claims" },
  openGraph: {
    url: "https://cheap.gg/claims",
    title: "My Claims | Cheap.gg",
    description: "View and track your reward claims on Cheap.gg.",
  },
};

export default function Page() {
  return <ClaimsPage />;
}

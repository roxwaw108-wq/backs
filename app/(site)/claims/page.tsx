import { ClaimsPage } from "../../components/pages/ClaimsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Claims",
  description: "Track your EarnPets reward claims, Roblox payouts, and completed redemptions in one place.",
  alternates: { canonical: "https://earnpets.com/claims" },
  openGraph: {
    url: "https://earnpets.com/claims",
    title: "My Claims | EarnPets",
    description: "Track your EarnPets reward claims, Roblox payouts, and completed redemptions in one place.",
  },
};

export default function Page() {
  return <ClaimsPage />;
}

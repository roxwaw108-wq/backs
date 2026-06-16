import { AffiliatePage } from "../../components/pages/AffiliatePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description: "Join the EarnPets affiliate program and earn extra Robux by referring friends to complete offers and rewards.",
  alternates: { canonical: "https://earnpets.com/affiliate" },
  openGraph: {
    url: "https://earnpets.com/affiliate",
    title: "Affiliate Program | EarnPets",
    description: "Join the EarnPets affiliate program and earn extra Robux by referring friends to complete offers and rewards.",
  },
};

export default function Page() {
  return <AffiliatePage />;
}

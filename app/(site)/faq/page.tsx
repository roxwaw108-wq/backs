import { FaqPage } from "../../components/pages/FaqPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Read frequently asked questions about EarnPets, free Robux offers, withdrawals, claims, and account support.",
  alternates: { canonical: "https://earnpets.com/faq" },
  openGraph: {
    url: "https://earnpets.com/faq",
    title: "FAQ | EarnPets",
    description: "Read frequently asked questions about EarnPets, free Robux offers, withdrawals, claims, and account support.",
  },
};

export default function Page() {
  return <FaqPage />;
}

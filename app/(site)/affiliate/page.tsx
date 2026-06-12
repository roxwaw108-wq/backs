import { AffiliatePage } from "../../components/pages/AffiliatePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description: "Earn extra Robux by referring friends to Cheap.gg.",
  alternates: { canonical: "https://cheap.gg/affiliate" },
  openGraph: {
    url: "https://cheap.gg/affiliate",
    title: "Affiliate Program | Cheap.gg",
    description: "Earn extra Robux by referring friends to Cheap.gg.",
  },
};

export default function Page() {
  return <AffiliatePage />;
}

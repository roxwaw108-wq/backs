import { FaqPage } from "../../components/pages/FaqPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Cheap.gg.",
  alternates: { canonical: "https://cheap.gg/faq" },
  openGraph: {
    url: "https://cheap.gg/faq",
    title: "FAQ | Cheap.gg",
    description: "Frequently asked questions about Cheap.gg.",
  },
};

export default function Page() {
  return <FaqPage />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with your Cheap.gg account and rewards.",
  alternates: { canonical: "https://cheap.gg/support" },
  openGraph: {
    url: "https://cheap.gg/support",
    title: "Support | Cheap.gg",
    description: "Get help with your Cheap.gg account and rewards.",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

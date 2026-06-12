import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./cheapgg.css";
import { AppProvider } from "./context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cheap.gg"),
  title: {
    default: "Cheap.gg - Earn Free Robux and Roblox from Offers & Tasks",
    template: "%s | Cheap.gg",
  },
  description:
    "Earn free Robux on Cheap.gg by completing surveys, offers, and games. Fast rewards, instant cashouts, and support for Roblox items including Adopt Me and MM2.",
  alternates: {
    canonical: "https://cheap.gg",
  },
  openGraph: {
    type: "website",
    url: "https://cheap.gg",
    siteName: "Cheap.gg",
    title: "Cheap.gg - Earn Free Robux and Roblox from Offers & Tasks",
    description:
      "Earn free Robux on Cheap.gg by completing surveys, offers, and games. Fast rewards, instant cashouts, and support for Roblox items including Adopt Me and MM2.",
    images: [{ url: "/headerlogo.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cheap.gg - Earn Free Robux and Roblox from Offers & Tasks",
    description:
      "Earn free Robux on Cheap.gg by completing surveys, offers, and games. Fast rewards, instant cashouts, and support for Roblox items including Adopt Me and MM2.",
    images: ["/headerlogo.webp"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VLNJ6P8NDP"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-VLNJ6P8NDP');`}
        </Script>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
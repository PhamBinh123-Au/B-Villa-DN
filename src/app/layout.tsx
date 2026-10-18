import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { siteConfig } from "@/config/siteConfig";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://b-villa-dn.vercel.app"),
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  keywords: [
    "Da Nang luxury villas",
    "Da Nang villa rental",
    "Son Tra villa",
    "Ngu Hanh Son villa",
    "Private pool villa Da Nang",
    "Vietnam luxury hospitality",
  ],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.tagline,
    images: ["/images/gallery/pool-oasis.jpg"],
    type: "website",
  },
  icons: {
    icon: [
      { url: "/images/logo.png" },
    ],
    shortcut: ["/images/logo.png"],
    apple: [
      { url: "/images/logo.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={plusJakartaSans.variable}
    >
      <head />
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col bg-[#FAF8F5] text-[#14171A]`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

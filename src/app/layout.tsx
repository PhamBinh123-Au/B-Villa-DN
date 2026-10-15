import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { siteConfig } from "@/config/siteConfig";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://serenedanangvillas.vercel.app"),
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
      className={quicksand.variable}
    >
      <head />
      <body
        suppressHydrationWarning
        className={`${quicksand.className} antialiased min-h-screen flex flex-col bg-[#FAF8F5] text-[#14171A]`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { siteConfig } from "@/config/siteConfig";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
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
      className={`scroll-smooth ${playfair.variable} ${plusJakarta.variable}`}
    >
      <body className="antialiased min-h-screen flex flex-col bg-[#FAF8F5] font-sans text-[#14171A]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

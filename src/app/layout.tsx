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
  alternates: {
    canonical: "https://b-villa-dn.vercel.app",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.tagline,
    url: "https://b-villa-dn.vercel.app",
    siteName: siteConfig.name,
    images: [
      {
        url: "https://b-villa-dn.vercel.app/images/gallery/pool-oasis.jpg",
        width: 1200,
        height: 630,
        alt: "B Villa Da Nang Luxury Pool Sanctuary",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.tagline,
    images: ["https://b-villa-dn.vercel.app/images/gallery/pool-oasis.jpg"],
  },
  icons: {
    icon: [{ url: "/images/logo.png" }],
    shortcut: ["/images/logo.png"],
    apple: [{ url: "/images/logo.png" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://b-villa-dn.vercel.app/#organization",
      "name": "B Villa Da Nang",
      "alternateName": "B Villa Luxury Coastal Sanctuaries",
      "url": "https://b-villa-dn.vercel.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://b-villa-dn.vercel.app/images/logo.png",
        "width": "512",
        "height": "512",
      },
      "description":
        "Discover an exceptional collection of private pool villas designed with contemporary minimalism, pure architectural light, and bespoke hospitality in Da Nang.",
      "email": "kimthuy.dn22@gmail.com",
      "telephone": "+84854252821",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "60 Thanh Vinh 3, Tho Quang",
        "addressLocality": "Son Tra District",
        "addressRegion": "Da Nang",
        "postalCode": "550000",
        "addressCountry": "VN",
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+84854252821",
          "email": "kimthuy.dn22@gmail.com",
          "contactType": "customer service",
          "areaServed": "VN",
          "availableLanguage": ["Vietnamese", "English"],
        },
        {
          "@type": "ContactPoint",
          "telephone": "+84854252821",
          "contactType": "reservations",
          "areaServed": "VN",
          "availableLanguage": ["Vietnamese", "English"],
        },
      ],
      "sameAs": [
        "https://zalo.me/0854252821",
        "https://www.facebook.com/Flamingovilladanang",
        "https://www.tiktok.com/@bvilladanang43_",
      ],
    },
    {
      "@type": "LodgingBusiness",
      "@id": "https://b-villa-dn.vercel.app/#lodging",
      "name": "B Villa Da Nang",
      "description":
        "Exclusive private pool villas with modern architectural design, private gardens, and bespoke concierge in Da Nang.",
      "url": "https://b-villa-dn.vercel.app",
      "telephone": "+84854252821",
      "email": "kimthuy.dn22@gmail.com",
      "priceRange": "$$ - $$$",
      "currenciesAccepted": "VND, USD",
      "paymentAccepted": "Cash, Bank Transfer, Credit Card",
      "checkinTime": "14:00",
      "checkoutTime": "12:00",
      "image": [
        "https://b-villa-dn.vercel.app/images/gallery/pool-oasis.jpg",
        "https://b-villa-dn.vercel.app/images/villas/b1-villa.jpg",
        "https://b-villa-dn.vercel.app/images/villas/b2-villa.jpg",
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "60 Thanh Vinh 3, Tho Quang",
        "addressLocality": "Son Tra District",
        "addressRegion": "Da Nang",
        "postalCode": "550000",
        "addressCountry": "VN",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 16.1045,
        "longitude": 108.2435,
      },
      "amenityFeature": [
        {
          "@type": "LocationFeatureSpecification",
          "name": "Private Swimming Pool",
          "value": true,
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "High-Speed Wi-Fi",
          "value": true,
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Fully Equipped Kitchen",
          "value": true,
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Garden BBQ Grill",
          "value": true,
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Daily Housekeeping",
          "value": true,
        },
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "B Villa Da Nang Collection",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "B1 Villa (4 Bedrooms - Son Tra)",
            "description":
              "Full house private garden pool villa steps to Son Tra beach, 4 bedrooms, 4 bathrooms, up to 10 guests.",
            "price": "3000000",
            "priceCurrency": "VND",
            "availability": "https://schema.org/InStock",
            "url": "https://b-villa-dn.vercel.app/#villas",
          },
          {
            "@type": "Offer",
            "name": "B2 Villa (4 Bedrooms - Ngu Hanh Son)",
            "description":
              "Riverside sanctuary with skylight atrium private pool, 4 bedrooms, 4 bathrooms, up to 10 guests.",
            "price": "3000000",
            "priceCurrency": "VND",
            "availability": "https://schema.org/InStock",
            "url": "https://b-villa-dn.vercel.app/#villas",
          },
          {
            "@type": "Offer",
            "name": "B3 Villa (2 Bedrooms - Ngu Hanh Son)",
            "description":
              "Intimate plunge pool villa, 2 bedrooms, 2 bathrooms, up to 6 guests.",
            "price": "1800000",
            "priceCurrency": "VND",
            "availability": "https://schema.org/InStock",
            "url": "https://b-villa-dn.vercel.app/#villas",
          },
          {
            "@type": "Offer",
            "name": "B4 Villa (4 Bedrooms - Son Tra)",
            "description":
              "Contemporary architecture pool villa near Son Tra beach, 4 bedrooms, 4 bathrooms, up to 10 guests.",
            "price": "3000000",
            "priceCurrency": "VND",
            "availability": "https://schema.org/InStock",
            "url": "https://b-villa-dn.vercel.app/#villas",
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://b-villa-dn.vercel.app/#website",
      "url": "https://b-villa-dn.vercel.app",
      "name": "B Villa Da Nang",
      "description":
        "Curated Coastal Sanctuaries in Da Nang - Luxury Private Pool Villas",
      "publisher": {
        "@id": "https://b-villa-dn.vercel.app/#organization",
      },
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col bg-[#FAF8F5] text-[#14171A]`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

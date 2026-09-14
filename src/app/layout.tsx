import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { site } from "@/lib/content";
import { themeBootScript } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Make the thinking your own. • ${site.name}`,
    template: `%s • ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `Make the thinking your own. • ${site.name}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    images: [
      {
        url: "/brand/living-ink-poster.png",
        width: 1120,
        height: 1120,
        alt: "Socratink living ink orb",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Make the thinking your own. • ${site.name}`,
    description: site.description,
    images: ["/brand/living-ink-poster.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffcf0" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0f" },
  ],
  colorScheme: "light dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/OnlineOnly",
  },
  description: site.description,
  url: site.url,
  featureList: [
    "Voice-first Socratic dialogue",
    "Refusal to autocomplete answers",
    "Conceptual knowledge topology cartography",
    "Adaptive pedagogical engrams",
    "Zero tracking cookies & sovereign privacy",
  ],
  author: {
    "@type": "Organization",
    name: site.name,
    url: site.url,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="describedby" href="/llms.txt" />
        <script
          dangerouslySetInnerHTML={{ __html: themeBootScript }}
          suppressHydrationWarning
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}

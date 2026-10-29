import type { Metadata, Viewport } from "next";
import { Sora, Roboto } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SITE } from "@/lib/site";
import { Floating } from "@/components/Floating";
import { PixelTracker } from "@/components/PixelTracker";
import { getActivePixelConfigs } from "@/lib/pixels-repository";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
  display: "swap",
});
const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  display: "swap",
});

const description =
  "Sites, lojas virtuais, sistemas e marketing digital para pequenas e médias empresas. Proposta grátis em até 24h. Rio de Janeiro.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Mavox | Sites e sistemas que geram clientes para sua empresa",
    template: "%s | Mavox",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Mavox",
    title: "Mavox | Sites e sistemas que geram clientes",
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  other: {
    "facebook-domain-verification": "y8gayqxbbnj1owk409bxh73vayxxq6",
  },
  icons: {
    icon: "/favicon-mavox-100x100.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#110c38",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  name: "Mavox",
  url: SITE.url,
  logo: `${SITE.url}/logo.png`,
  telephone: "+5521992855872",
  email: SITE.emails[0],
  areaServed: "BR",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Princesa Isabel, 7, sala 731",
    addressLocality: "Rio de Janeiro",
    addressRegion: "RJ",
    addressCountry: "BR",
  },
  sameAs: SITE.socials.map((s) => s.href),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pixelConfigs = await getActivePixelConfigs();

  return (
    <html lang="pt-BR" className={`${sora.variable} ${roboto.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-paper-ink"
        >
          Pular para o conteúdo
        </a>
        {children}
        <Floating />
        <Toaster
          theme="system"
          richColors
          position="top-center"
          closeButton
          mobileOffset={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Injeção Dinâmica dos Pixels (Meta Ads e Google Ads) */}
        <PixelTracker
          metaPixelId={pixelConfigs.metaPixelId}
          googleTagId={pixelConfigs.googleTagId}
        />
      </body>
    </html>
  );
}

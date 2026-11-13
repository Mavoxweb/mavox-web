import type { Metadata, Viewport } from "next";
import { Sora, Roboto } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SITE } from "@/lib/site";
import { Floating } from "@/components/Floating";
import { PixelTracker } from "@/components/PixelTracker";
import GtmDataLayer from "@/components/GtmDataLayer";
import { getActivePixelConfigs } from "@/lib/pixels-repository";
import { claimCopy } from "@/data/claims";

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

const title = "Mavox | Criação de Sites, Lojas Virtuais e Tráfego Pago no Rio de Janeiro";
const description = claimCopy.metaDescription;
const schemaDescription = description.replace(/\s*Proposta grátis em até 24h\.?/, "").trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: title,
    template: "%s | Mavox",
  },
  description,
  applicationName: "Mavox",
  authors: [{ name: "Mavox Tecnologia e Marketing", url: SITE.url }],
  creator: "Mavox",
  publisher: "Mavox",
  keywords: [
    "criação de sites rio de janeiro",
    "desenvolvimento de landing pages alta conversão",
    "agência de marketing digital copacabana",
    "loja virtual e-commerce rj",
    "gestão de tráfego pago google ads meta ads",
    "desenvolvimento web profissional",
    "sistemas web sob medida nextjs",
    "consultoria de seo rj",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Mavox",
    title,
    description,
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mavox - Desenvolvimento Web e Marketing Digital de Alta Performance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    // Geo-targeting para Google e buscas locais
    "geo.region": "BR-RJ",
    "geo.placename": "Rio de Janeiro",
    "geo.position": "-22.9634;-43.1747",
    "ICBM": "-22.9634, -43.1747",
    // Verificações
    "facebook-domain-verification": "y8gayqxbbnj1owk409bxh73vayxxq6",
  },
  icons: {
    icon: "/favicon-mavox-100x100.jpg",
    apple: "/favicon-mavox-100x100.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1548",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

// Rich Structured Data (JSON-LD) para Google Search, Knowledge Graph, Gemini, ChatGPT e Claude
const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService", "LocalBusiness"],
      "@id": `${SITE.url}/#organization`,
      name: "Mavox",
      legalName: "Mavox Desenvolvimento Web e Marketing Digital",
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/logo.png`,
        width: 150,
        height: 50,
      },
      image: `${SITE.url}/logo.png`,
      telephone: "+5521992855872",
      email: SITE.emails[0],
      priceRange: "$$",
      currenciesAccepted: "BRL",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Av. Princesa Isabel, 7, sala 731",
        addressLocality: "Rio de Janeiro",
        addressRegion: "RJ",
        postalCode: "22011-010",
        addressCountry: "BR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9634,
        longitude: -43.1747,
      },
      hasMap: "https://maps.google.com/?q=Av.+Princesa+Isabel,+7+-+Copacabana,+Rio+de+Janeiro+-+RJ",
      areaServed: [
        {
          "@type": "AdministrativeArea",
          name: "Rio de Janeiro",
        },
        {
          "@type": "Country",
          name: "Brasil",
        },
      ],
      sameAs: SITE.socials.map((s) => s.href),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Serviços Digitais Mavox",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Landing Pages de Alta Conversão",
              description: "Páginas orientadas a conversão rápida de tráfego pago em clientes qualificados.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Criação de Sites Institucionais",
              description: "Desenvolvimento de sites profissionais modernos, rápidos e otimizados para SEO.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "E-commerce & Lojas Virtuais",
              description: "Lojas virtuais completas com meios de pagamento integrados e controle de estoque.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Gestão de Tráfego Pago (Google Ads e Meta Ads)",
              description: "Campanhas orientadas ao ROI e geração de contatos no WhatsApp.",
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: "Mavox",
      description: schemaDescription,
      publisher: {
        "@id": `${SITE.url}/#organization`,
      },
      inLanguage: "pt-BR",
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pixelConfigs = await getActivePixelConfigs();

  return (
    <html lang="pt-BR" className={`${sora.variable} ${roboto.variable}`}>
      <head>
        {/* Link para manifesto LLM / IA */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Context Summary" />
      </head>
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />

        {/* Injeção Dinâmica dos Pixels (GTM, GA4 via GTM, Meta Pixel + CAPI, TikTok) */}
        <PixelTracker
          metaPixelId={pixelConfigs.metaPixelId}
          gtmId={pixelConfigs.gtmId}
          tiktokPixelId={pixelConfigs.tiktokPixelId}
          metaCapiAccessToken={pixelConfigs.metaCapiAccessToken}
          metaCapiPixelId={pixelConfigs.metaCapiPixelId}
        />
        <GtmDataLayer />
      </body>
    </html>
  );
}

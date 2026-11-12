export type Case = {
  title: string;
  image: string;
  /** Rótulo da taxonomia de serviços. Ausente quando o site não pôde ser conferido. */
  tag?: string;
  url: string;
};

export const cases: Case[] = [
  {
    title: "TGX Engenharia",
    tag: "Site Institucional",
    url: "https://www.tgxengenharia.com.br/",
    image: "/cases/tgx-engenharia.webp",
  },
  {
    title: "Selenita",
    tag: "Landing Page",
    url: "https://selenita-smart-e-commerce-ai.vercel.app/",
    image: "/cases/selenita.webp",
  },
  {
    title: "SCAPE Saúde",
    tag: "Site Institucional",
    url: "https://scapesaude-institucional.vercel.app/",
    image: "/cases/scape-saude.webp",
  },
  {
    title: "Poupconsig",
    tag: "Site Institucional",
    url: "https://www.poupconsig.com.br/",
    image: "/cases/poupconsig.webp",
  },
  {
    title: "Lojas Dália",
    tag: "Loja Virtual",
    url: "https://lojasdalia.com.br/",
    image: "/cases/lojas-dalia.webp",
  },
  {
    title: "Geriatex",
    url: "https://www.geriatex.com.br/",
    image: "/cases/geriatex.webp",
  },
];

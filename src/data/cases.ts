export type CaseShot = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type PortfolioCase = {
  title: string;
  /** Tipo do projeto, só quando o próprio site ou o dono do projeto o sustentam. */
  tag: string;
  /** Uma linha neutra, tirada do que a página publica. */
  summary: string;
  url: string;
  linkLabel: string;
  desktop?: CaseShot;
  mobile?: CaseShot;
};

/**
 * URLs conferidas em 13/11/2026 (HTTP 200 e título coerente com o print).
 * scapesaude.com.br não resolve: o card fica no endereço da Vercel.
 * Ocafy: https://ocafy.vercel.app/ (web-three-sooty-70.vercel.app responde 404).
 */
export const cases: PortfolioCase[] = [
  {
    title: "TGX Engenharia",
    tag: "Site institucional",
    summary: "Alvarás e licenças para empresas.",
    url: "https://www.tgxengenharia.com.br/",
    linkLabel: "Visitar site",
    desktop: {
      src: "/cases/tgx-engenharia.webp",
      width: 1600,
      height: 893,
      alt: "Página inicial da TGX Engenharia no computador",
    },
    mobile: {
      src: "/cases/tgx-engenharia-mobile.webp",
      width: 400,
      height: 844,
      alt: "Página inicial da TGX Engenharia no celular",
    },
  },
  {
    title: "Selenita",
    tag: "Landing page",
    summary: "Provador virtual para e-commerces.",
    url: "https://selenita-smart-e-commerce-ai.vercel.app/",
    linkLabel: "Visitar site",
    desktop: {
      src: "/cases/selenita.webp",
      width: 1600,
      height: 893,
      alt: "Landing page da Selenita no computador",
    },
    mobile: {
      src: "/cases/selenita-mobile.webp",
      width: 400,
      height: 844,
      alt: "Landing page da Selenita no celular",
    },
  },
  {
    title: "SCAPE Saúde",
    tag: "Site institucional",
    summary: "Avaliação neuropsicológica e psicologia.",
    url: "https://scapesaude-institucional.vercel.app/",
    linkLabel: "Visitar site",
    desktop: {
      src: "/cases/scape-saude.webp",
      width: 1600,
      height: 893,
      alt: "Página inicial da SCAPE Saúde no computador",
    },
    mobile: {
      src: "/cases/scape-saude-mobile.webp",
      width: 400,
      height: 844,
      alt: "Página inicial da SCAPE Saúde no celular",
    },
  },
  {
    title: "Poupconsig",
    tag: "Site institucional",
    summary: "Crédito consignado.",
    url: "https://www.poupconsig.com.br/",
    linkLabel: "Visitar site",
    desktop: {
      src: "/cases/poupconsig.webp",
      width: 1600,
      height: 893,
      alt: "Página inicial da Poupconsig no computador",
    },
    mobile: {
      src: "/cases/poupconsig-mobile.webp",
      width: 400,
      height: 844,
      alt: "Página inicial da Poupconsig no celular",
    },
  },
  {
    title: "Lojas Dália",
    tag: "Loja virtual",
    summary: "Cama, mesa e banho.",
    url: "https://lojasdalia.com.br/",
    linkLabel: "Visitar site",
    desktop: {
      src: "/cases/lojas-dalia.webp",
      width: 1600,
      height: 893,
      alt: "Loja virtual das Lojas Dália no computador",
    },
    mobile: {
      src: "/cases/lojas-dalia-mobile.webp",
      width: 400,
      height: 844,
      alt: "Loja virtual das Lojas Dália no celular",
    },
  },
  {
    title: "Geriatex",
    tag: "Site institucional",
    summary: "Produtos de higiene pessoal adulto.",
    url: "https://www.geriatex.com.br/",
    linkLabel: "Visitar site",
    desktop: {
      src: "/cases/geriatex.webp",
      width: 1440,
      height: 900,
      alt: "Página inicial da Geriatex no computador",
    },
    mobile: {
      src: "/cases/geriatex-mobile.webp",
      width: 780,
      height: 1688,
      alt: "Página inicial da Geriatex no celular",
    },
  },
  {
    title: "Ocafy",
    tag: "Aplicativo",
    summary: "Deixa a casa ok.",
    url: "https://ocafy.vercel.app/",
    linkLabel: "Abrir aplicativo",
    mobile: {
      src: "/cases/ocafy.webp",
      width: 780,
      height: 1688,
      alt: "Tela de entrada do aplicativo Ocafy no celular",
    },
  },
];

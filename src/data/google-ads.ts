export const GOOGLE_ADS_PATH = "/google-ads";

export type OfferId = "combo" | "site" | "ads";

export type Offer = {
  id: OfferId;
  name: string;
  price: string;
  compareAt?: string;
  detail: string;
  includes: string[];
  code: string;
  service: string;
  featured?: boolean;
  badge?: string;
};

export const offers: readonly Offer[] = [
  {
    id: "combo",
    name: "Combo site + Google Ads",
    price: "R$ 800",
    compareAt: "R$ 1.500",
    detail: "Oferta de entrada da Black November. Site profissional com setup e gestão de Google Ads.",
    includes: ["Site profissional", "Configuração do Google Ads", "Gestão dos anúncios"],
    code: "black-november-combo-800",
    service: "Combo site + Google Ads",
    featured: true,
    badge: "Black November",
  },
  {
    id: "site",
    name: "Só o site",
    price: "R$ 499",
    detail: "Site profissional com hospedagem e domínio .com.br.",
    includes: ["Site profissional", "Hospedagem", "Domínio .com.br"],
    code: "site-499",
    service: "Site profissional",
  },
  {
    id: "ads",
    name: "Só Google Ads",
    price: "R$ 950",
    detail: "Setup e gestão de Google Ads para quem já tem onde receber o clique.",
    includes: ["Configuração do Google Ads", "Gestão dos anúncios"],
    code: "google-ads-950",
    service: "Google Ads",
  },
] as const;

export function offerById(id: OfferId): Offer {
  const offer = offers.find((item) => item.id === id);
  if (!offer) return offers[0];
  return offer;
}

export const founderBrands = [
  "Reserva",
  "Domino's",
  "Mercedes",
  "Dalia",
  "Stone",
  "Amazon",
  "Americanas",
] as const;

export const pains = [
  {
    title: "Depender de indicação",
    text: "O mês vai bem quando alguém lembra de você. Quando ninguém indica, o caixa para.",
  },
  {
    title: "Não ser encontrado no Google",
    text: "Quem pesquisa o serviço na sua cidade encontra outro negócio e chama esse outro.",
  },
  {
    title: "Só ter Instagram ou um site fraco",
    text: "O perfil mostra o trabalho, mas não sustenta uma busca no Google nem uma campanha de anúncio.",
  },
] as const;

export const steps = [
  { title: "Você chama", text: "Manda uma mensagem no WhatsApp ou envia nome, WhatsApp, empresa e cidade no formulário." },
  { title: "A gente alinha", text: "Entendemos o negócio, a cidade e qual oferta faz sentido: combo, só site ou só Google Ads." },
  { title: "Colocamos no ar", text: "O site entra no ar e, na oferta com anúncios, a campanha de Google Ads é configurada e acompanhada." },
] as const;

export const faq = [
  {
    q: "O que está incluso no combo de R$ 800?",
    a: "Site profissional, configuração do Google Ads e gestão dos anúncios. O valor cheio dessa combinação é R$ 1.500. R$ 800 é o preço de Black November.",
  },
  {
    q: "A verba dos anúncios está inclusa?",
    a: "Não. Os preços desta página são o serviço da Mavox. O valor que o Google cobra por clique é pago direto na conta de anúncios, à parte.",
  },
  {
    q: "O site de R$ 499 inclui domínio e hospedagem?",
    a: "Sim. A oferta de só o site inclui hospedagem e domínio .com.br.",
  },
  {
    q: "Posso contratar só o Google Ads?",
    a: "Sim. Setup e gestão de Google Ads saem por R$ 950, para quem já tem um site para receber a visita.",
  },
  {
    q: "Em quanto tempo começa?",
    a: "O prazo é combinado no atendimento, depois de vermos o negócio e a cidade. Não há um prazo único publicado para esta campanha.",
  },
  {
    q: "Reserva, Domino's, Mercedes e as outras marcas são clientes da Mavox?",
    a: "Não. Essas marcas aparecem só como experiência do fundador. Não são clientes da Mavox e não devem ser lidas como portfólio da agência.",
  },
  {
    q: "Como vocês usam meus dados?",
    a: "Nome, WhatsApp, empresa e cidade servem para retornar o contato desta campanha. A política de privacidade descreve o tratamento e os seus direitos.",
  },
] as const;

const offerLine: Record<OfferId, string> = {
  combo: "o combo site + Google Ads por R$ 800",
  site: "só o site por R$ 499",
  ads: "só o Google Ads por R$ 950",
};

export function waText(offer: OfferId | "floating" | "success" = "combo") {
  if (offer === "floating") {
    return "Olá! Vim pelo anúncio da Mavox (Black November) e quero o combo site + Google Ads por R$ 800.";
  }
  if (offer === "success") {
    return "Olá! Acabei de enviar o formulário da campanha Black November da Mavox.";
  }
  return `Olá! Vim pelo anúncio da Mavox (Black November) e quero ${offerLine[offer]}.`;
}

export const waMessage = {
  hero: waText("combo"),
  floating: waText("floating"),
  success: waText("success"),
  combo: waText("combo"),
  site: waText("site"),
  ads: waText("ads"),
};

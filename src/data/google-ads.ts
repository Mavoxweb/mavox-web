export const GOOGLE_ADS_PATH = "/google-ads";

/**
 * Textos da campanha num lugar só. O dono ainda confirma prazo e pagamento.
 * Troque aqui para atualizar hero, cards, FAQ e mensagens de WhatsApp.
 */
export const CAMPAIGN = {
  deadlineLabel: "Black November · até 30/11",
  paymentLabel: "Pagamento no PIX",
  comboReturns: "Depois de 30/11 o combo volta a R$ 1.500",
} as const;

/** Nome do fundador ainda não confirmado. Não preencher com um nome inventado. */
export const FOUNDER_NAME = "";

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
    name: "Site profissional + configuração da campanha no Google Ads",
    price: "R$ 800",
    compareAt: "R$ 1.500",
    detail: "Site profissional e a configuração da campanha de pesquisa no Google Ads.",
    includes: ["Site profissional", "Configuração da campanha no Google Ads"],
    code: "black-november-combo-800",
    service: "Site profissional + configuração da campanha no Google Ads",
    featured: true,
    badge: CAMPAIGN.deadlineLabel,
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
    name: "Configuração da campanha no Google Ads",
    price: "R$ 950",
    detail: "Configuração única da campanha. A verba dos anúncios é paga direto ao Google.",
    includes: ["Configuração da campanha no Google Ads"],
    code: "google-ads-950",
    service: "Configuração da campanha no Google Ads",
  },
] as const;

export function offerById(id: OfferId): Offer {
  const offer = offers.find((item) => item.id === id);
  if (!offer) return offers[0];
  return offer;
}

export const founderBrands = ["Reserva", "Domino's", "Mercedes", "Stone", "Amazon", "Americanas"] as const;

export function founderSentence() {
  const brands = `${founderBrands.slice(0, -1).join(", ")} e ${founderBrands.at(-1)}`;
  const name = FOUNDER_NAME.trim();
  const who = name ? `${name}, fundador da Mavox,` : "O fundador da Mavox";
  return `${who} tem +164 projetos entregues e já trabalhou com marcas como ${brands}.`;
}

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
  { title: "A gente alinha", text: "Entendemos o negócio, a cidade e qual oferta faz sentido: combo, só site ou só a configuração da campanha." },
  { title: "Colocamos no ar", text: "O site entra no ar e, na oferta com anúncios, a campanha de Google Ads é configurada." },
] as const;

export const faq = [
  {
    q: "O que está incluso no combo de R$ 800?",
    a: "Site profissional e a configuração da campanha no Google Ads. O valor cheio dessa combinação é R$ 1.500. Até 30/11 ela sai por R$ 800.",
  },
  {
    q: "A verba dos anúncios está inclusa?",
    a: "Não. Os preços desta página são o serviço da Mavox. A verba dos anúncios é paga direto ao Google.",
  },
  {
    q: "Por que o combo sai mais barato que só o Ads?",
    a: `Até 30/11, o combo reúne o site profissional e a configuração da campanha por R$ 800. A configuração da campanha sozinha é R$ 950. ${CAMPAIGN.comboReturns}.`,
  },
  {
    q: "Como é o pagamento?",
    a: `${CAMPAIGN.paymentLabel}. ${CAMPAIGN.comboReturns}.`,
  },
  {
    q: "O site de R$ 499 inclui domínio e hospedagem?",
    a: "Sim. A oferta de só o site inclui hospedagem e domínio .com.br.",
  },
  {
    q: "O que é a oferta de R$ 950?",
    a: "É a configuração única da campanha no Google Ads, para quem já tem um site. A verba dos anúncios é paga direto ao Google.",
  },
  {
    q: "Em quanto tempo começa?",
    a: "O início é combinado no atendimento, depois de vermos o negócio e a cidade.",
  },
  {
    q: "Como vocês usam meus dados?",
    a: "Nome, WhatsApp, empresa e cidade servem para retornar o contato desta campanha. A política de privacidade descreve o tratamento e os seus direitos.",
  },
] as const;

const offerLine: Record<OfferId, string> = {
  combo: "o combo de site profissional e configuração da campanha no Google Ads por R$ 800",
  site: "só o site por R$ 499",
  ads: "a configuração da campanha no Google Ads por R$ 950",
};

export function waText(offer: OfferId | "floating" | "success" = "combo") {
  if (offer === "floating") {
    return "Olá! Vim pelo anúncio da Mavox (Black November) e quero o combo de site + configuração da campanha no Google Ads por R$ 800.";
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

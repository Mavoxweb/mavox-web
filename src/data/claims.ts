/**
 * Promessas ainda não confirmadas pelo dono.
 * Ligue a flag para o texto original voltar ao ar.
 */
export const CLAIMS = {
  replyWithin24h: false,
  mostRequested: false,
  limitedAgenda: false,
} as const;

const WHATSAPP = "Respondemos pelo WhatsApp";

export const claimCopy = {
  metaDescription: CLAIMS.replyWithin24h
    ? "Agência de tecnologia e marketing digital no Rio de Janeiro (Copacabana). Especialistas em sites institucionais, landing pages de alta conversão, e-commerce e tráfego pago (Google Ads e Meta Ads). Proposta grátis em até 24h."
    : "Agência de tecnologia e marketing digital no Rio de Janeiro (Copacabana). Especialistas em sites institucionais, landing pages de alta conversão, e-commerce e tráfego pago (Google Ads e Meta Ads). Respondemos pelo WhatsApp.",
  ogLine: CLAIMS.replyWithin24h ? "Proposta grátis em até 24h" : WHATSAPP,
  heroLead: CLAIMS.replyWithin24h
    ? "Sites, lojas e sistemas pensados para uma coisa só: gerar contatos e aumentar o faturamento da sua empresa. Sem enrolação e com proposta em até 24h."
    : "Sites, lojas e sistemas pensados para uma coisa só: gerar contatos e aumentar o faturamento da sua empresa. Sem enrolação. Respondemos pelo WhatsApp.",
  heroAssurance: CLAIMS.replyWithin24h ? "Resposta em até 24h" : WHATSAPP,
  processProposal: CLAIMS.replyWithin24h
    ? "Escopo, prazo e investimento detalhados em até 24h, sem letras miúdas."
    : "Escopo, prazo e investimento detalhados, sem letras miúdas. Respondemos pelo WhatsApp.",
  guaranteeTitle: CLAIMS.replyWithin24h ? "Proposta em 24h" : WHATSAPP,
  faqPriceAnswer: CLAIMS.replyWithin24h
    ? "O valor depende inteiramente do que seu negócio precisa para atingir os objetivos. Por isso, não usamos tabelas de preço fixo. Montamos uma proposta personalizada, gratuita e sem compromisso em até 24h, com escopo, prazo e investimento definidos. Você investe apenas no que realmente vai gerar resultado."
    : "O valor depende inteiramente do que seu negócio precisa para atingir os objetivos. Por isso, não usamos tabelas de preço fixo. Montamos uma proposta personalizada, gratuita e sem compromisso. Respondemos pelo WhatsApp, com escopo, prazo e investimento definidos. Você investe apenas no que realmente vai gerar resultado.",
  finalLead: CLAIMS.replyWithin24h
    ? "Conte sobre o seu negócio e receba, em até 24h, uma proposta clara com escopo, prazo e investimento. Sem compromisso e sem pegadinhas."
    : "Conte sobre o seu negócio e receba uma proposta clara com escopo, prazo e investimento. Sem compromisso e sem pegadinhas. Respondemos pelo WhatsApp.",
  finalPoint: CLAIMS.replyWithin24h ? "Proposta detalhada em até 24h" : WHATSAPP,
  agenda: "Agenda de novos projetos limitada neste mês",
  formHint: CLAIMS.replyWithin24h
    ? "Leva menos de 1 minuto. Respondemos em até 24h."
    : "Leva menos de 1 minuto. Respondemos pelo WhatsApp.",
  formSuccess: CLAIMS.replyWithin24h
    ? "Recebemos! Sua proposta chega em até 24h."
    : "Recebemos! Respondemos pelo WhatsApp.",
  quoteToast: CLAIMS.replyWithin24h
    ? "Pedido enviado! Resposta em até 24h."
    : "Pedido enviado! Respondemos pelo WhatsApp.",
  quoteDone: CLAIMS.replyWithin24h
    ? "Nossa equipe vai analisar seu briefing e enviar a proposta em até 24h. Quer acelerar? Chame a gente agora."
    : "Nossa equipe vai analisar seu briefing. Respondemos pelo WhatsApp. Quer falar agora? Chame a gente.",
  orcamentoDescription: CLAIMS.replyWithin24h
    ? "Conte o que sua empresa precisa e receba uma proposta personalizada da Mavox em até 24h."
    : "Conte o que sua empresa precisa. Respondemos pelo WhatsApp.",
  orcamentoTitle: CLAIMS.replyWithin24h
    ? "Receba uma proposta sob medida em até 24h"
    : "Receba uma proposta sob medida",
  blogCta: CLAIMS.replyWithin24h
    ? "Receba uma proposta personalizada da Mavox em até 24h, sem compromisso."
    : "Receba uma proposta personalizada da Mavox. Respondemos pelo WhatsApp.",
  mostRequestedBadge: "Mais pedido",
} as const;

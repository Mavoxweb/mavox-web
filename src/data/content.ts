import { claimCopy } from "./claims";

export const pains = [
  { icon: "monitor", problem: "Seu site existe, mas não vende", text: "Visitas entram e ninguém chama. Um site sem estratégia é só um cartão de visitas caro.", fix: "Cada página é desenhada para levar o visitante até o contato." },
  { icon: "trend", problem: "Seu faturamento depende de indicação", text: "Sem um canal digital previsível, o caixa oscila e o crescimento fica por conta da sorte.", fix: "Site, anúncios e rastreio trabalhando juntos para gerar demanda todo mês." },
  { icon: "user", problem: "Agências somem depois da entrega", text: "O site vai ao ar, o suporte sai do ar, e o acesso ao que você pagou fica na mão de terceiros.", fix: "Tudo documentado no seu nome, com suporte humano por WhatsApp." },
] as const;

export const process = [
  { title: "Diagnóstico gratuito", text: "Entendemos seu negócio, público e metas. Você sai com clareza, fechando ou não." },
  { title: "Proposta sob medida", text: claimCopy.processProposal },
  { title: "Desenvolvimento acompanhado", text: "Você vê o projeto evoluir e aprova cada etapa antes de seguirmos." },
  { title: "Lançamento e evolução", text: "Publicamos, treinamos você e continuamos ao seu lado para crescer." },
];

export const guarantees = [
  { icon: "clock", title: claimCopy.guaranteeTitle, text: "Escopo, prazo e investimento claros." },
  { icon: "key", title: "Tudo no seu nome", text: "Código e domínio são seus." },
  { icon: "layers", title: "Pagamento por etapas", text: "Você só avança quando aprova." },
  { icon: "headset", title: "Suporte humano", text: "Direto no WhatsApp, sem robô." },
] as const;

export type Testimonial = { quote: string; name: string; role: string; company: string; photo?: string };

/** TODO(dados reais): depoimentos verdadeiros com foto. Sem itens, a seção é ocultada. */
export const testimonials: Testimonial[] = [];

export const faq = [
  { q: "Quanto custa um site?", a: claimCopy.faqPriceAnswer },
  { q: "Em quanto tempo meu site fica pronto?", a: "Temos prazos ágeis e transparentes: landing pages saem a partir de 7 dias e sites institucionais a partir de 15. O prazo exato é definido na sua proposta, e você acompanha cada etapa da evolução do projeto conosco." },
  { q: "O site será meu de verdade?", a: "Sim, 100%. Domínio, hospedagem e todo o código desenvolvido para o seu projeto ficam em seu nome. Você nunca ficará refém de nossa agência ou de licenças restritivas." },
  { q: "E se eu precisar de ajuda depois da entrega?", a: "Você não fica na mão. Oferecemos suporte direto por WhatsApp e planos de manutenção que garantem backups diários, segurança contra invasões e melhorias contínuas para o seu site nunca parar." },
  { q: "Vocês atendem empresas pequenas?", a: "Essa é a nossa especialidade e paixão. Nossa missão é levar tecnologia de alto nível — como a que grandes empresas usam — para pequenas e médias empresas, de forma acessível e democrática." },
  { q: "Como funciona o pagamento?", a: "Tudo é feito de forma transparente. Dividimos o investimento por etapas aprovadas, aceitando Pix, cartão ou boleto. Você só avança para a próxima fase quando está satisfeito com o que foi entregue até ali." },
];

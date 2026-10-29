export type ServiceSlug =
  | "site-institucional"
  | "landing-page"
  | "e-commerce"
  | "sistemas-sob-medida"
  | "trafego-marketing"
  | "gestao-redes-sociais"
  | "branding-rebranding"
  | "manutencao-suporte";

export type Service = {
  slug: ServiceSlug;
  icon: "globe" | "target" | "cart" | "code" | "chart" | "megaphone" | "palette" | "shield";
  name: string;
  promise: string;
  forWho: string;
  includes: string[];
  deadline: string;
  /** TODO(dados reais): ex. "R$ 1.490". Sem valor, o preço fica oculto. */
  priceFrom?: string;
  featured?: boolean;
  badge?: string;
};

export const services: Service[] = [
  {
    slug: "landing-page",
    icon: "target",
    name: "Landing Page de Alta Conversão",
    promise: "Uma página com um único objetivo: transformar cada clique do seu anúncio em contato qualificado.",
    forWho: "Quem investe em anúncios e precisa que cada visita valha dinheiro.",
    includes: [
      "Copy persuasiva escrita por quem vende",
      "Carregamento ultrarrápido, menos abandono",
      "Rastreamento de Meta, Google e conversões",
      "Estrutura pronta para testes A/B",
    ],
    deadline: "A partir de 7 dias",
    featured: true,
    badge: "Mais pedido",
  },
  {
    slug: "gestao-redes-sociais",
    icon: "megaphone",
    name: "Conteúdo Digital que Alavanca Vendas",
    promise: "Não é só postar bonito. É criar presença diária que posiciona sua autoridade e transforma seguidores em clientes que pagam.",
    forWho: "Empresas que já têm produto, mas não conseguem manter as redes ativas com estratégia de venda.",
    includes: [
      "Estratégia de conteúdo mensal",
      "Criação de posts, reels e stories",
      "Copy focada em conversão",
      "Gestão de comunidade e mensagens",
      "Relatório de alcance e engajamento",
    ],
    deadline: "Início em 5 dias",
  },
  {
    slug: "site-institucional",
    icon: "globe",
    name: "Site Institucional Premium",
    promise: "A vitrine que faz sua empresa ser escolhida antes da primeira conversa.",
    forWho: "Empresas que perdem credibilidade com um site amador ou desatualizado.",
    includes: [
      "Design exclusivo, nunca template pronto",
      "SEO técnico para aparecer no Google",
      "WhatsApp e formulários que captam leads",
      "Painel simples para você editar sozinho",
    ],
    deadline: "A partir de 15 dias",
  },
  {
    slug: "e-commerce",
    icon: "cart",
    name: "Loja Virtual Completa",
    promise: "Venda 24 horas por dia, com checkout simples que não deixa o cliente desistir.",
    forWho: "Quem quer vender com marca própria, sem comissão abusiva de marketplace.",
    includes: [
      "Pix, cartão e boleto integrados",
      "Frete automático e controle de estoque",
      "Recuperação de carrinho abandonado",
      "Treinamento para sua equipe operar",
    ],
    deadline: "A partir de 30 dias",
  },
  {
    slug: "sistemas-sob-medida",
    icon: "code",
    name: "Sistemas e Apps sob Medida",
    promise: "Troque planilhas e improviso por um sistema que trabalha do jeito do seu negócio.",
    forWho: "Empresas que cresceram e agora precisam de controle e automação.",
    includes: [
      "Consultoria de requisitos antes de codar",
      "Banco de dados seguro na nuvem",
      "Painéis, relatórios e níveis de acesso",
      "Código seu, sem mensalidade de licença",
    ],
    deadline: "Prazo sob análise",
  },
  {
    slug: "trafego-marketing",
    icon: "chart",
    name: "Tráfego Pago que Gera Clientes",
    promise: "Coloque sua frente de quem já procura por ela, todos os dias, e pague só pelo que funciona.",
    forWho: "Quem já tem site e quer previsibilidade de novos clientes.",
    includes: [
      "Campanhas no Google e Meta Ads",
      "Criativos e copy focados em venda",
      "Relatório claro: quanto entrou, quanto custou",
      "Otimização semanal contínua",
    ],
    deadline: "Início em 5 dias",
  },
  {
    slug: "branding-rebranding",
    icon: "palette",
    name: "Marca de Alto Valor",
    promise: "Uma identidade que não só parece profissional — ela posiciona você como a escolha óbvia e permite cobrar preços melhores.",
    forWho: "Empresas que perdem clientes para concorrentes menos qualificados, só porque a marca passa confiança inferior.",
    includes: [
      "Estratégia de posicionamento de marca",
      "Logo e sistema visual completo",
      "Paleta, tipografia e manuais de uso",
      "Aplicação em cartão, rede social e site",
    ],
    deadline: "A partir de 15 dias",
  },
  {
    slug: "manutencao-suporte",
    icon: "shield",
    name: "Manutenção, Hospedagem e Suporte",
    promise: "Seu site seguro, rápido e no ar, com um time real para chamar quando precisar.",
    forWho: "Quem não quer dor de cabeça com queda, bug ou invasão.",
    includes: [
      "Hospedagem de alta performance e SSL",
      "Backups automáticos diários",
      "Monitoramento e correções de segurança",
      "Suporte direto por WhatsApp",
    ],
    deadline: "Atendimento contínuo",
  },
];

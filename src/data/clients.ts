/** Logos nas cores originais. `lightLogo: true` para logos brancas, exibidas em navy para aparecer sobre o fundo claro. */
export type Client = { name: string; logo: string; width: number; height: number; lightLogo?: boolean };

/**
 * Empresas com as quais a Mavox já trabalhou. Logos em /public/clientes, nas cores originais.
 * A seção só é exibida com 6 ou mais clientes.
 */
export const clients: Client[] = [
  { name: "Mercedes-Benz", logo: "/clientes/mercedes.svg", width: 64, height: 64 },
  { name: "Amazon", logo: "/clientes/amazon.svg", width: 603, height: 182 },
  { name: "Americanas", logo: "/clientes/americanas.svg", width: 163, height: 32 },
  { name: "Lojas Dália", logo: "/clientes/lojas-dalia.png", width: 575, height: 230, lightLogo: true },
  { name: "Domino's", logo: "/clientes/dominos.svg", width: 163, height: 164 },
  { name: "Reserva", logo: "/clientes/reserva.svg", width: 28, height: 32 },
  { name: "Ortobom", logo: "/clientes/ortobom.png", width: 260, height: 39 },
  { name: "Geriatex", logo: "/clientes/geriatex.png", width: 988, height: 275 },
  { name: "Poupconsig", logo: "/clientes/poupconsig.png", width: 690, height: 132 },
];
export const MIN_CLIENTS = 6;
export const showClients = clients.length >= MIN_CLIENTS;

export type Metric = { prefix?: string; value: number; suffix?: string; label: string };

/**
 * Só entra número confirmado. +164 projetos é real; não inventar outras faixas.
 */
export const metrics: Metric[] = [
  { prefix: "+", value: 164, label: "projetos" },
];

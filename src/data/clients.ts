export type Client = { name: string; logo: string; width: number; height: number };

/**
 * TODO(dados reais): adicione logos reais em /public/clients (SVG/PNG, de preferência monocromáticos).
 * A seção só é exibida com 6 ou mais clientes.
 * Ex.: { name: "Empresa X", logo: "/clients/empresa-x.svg", width: 160, height: 48 }
 */
export const clients: Client[] = [];
export const MIN_CLIENTS = 6;
export const showClients = clients.length >= MIN_CLIENTS;

export type Metric = { prefix?: string; value: number; suffix?: string; label: string };

/**
 * Só entra número confirmado. +164 projetos é real; não inventar outras faixas.
 */
export const metrics: Metric[] = [
  { prefix: "+", value: 164, label: "projetos" },
];

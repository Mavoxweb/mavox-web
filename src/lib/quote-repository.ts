import type { QuoteRequest } from "./quote";
import type { LeadInput } from "./lead";

/**
 * Camada de persistência do sistema de orçamentos.
 * FASE 1 (agora): apenas registra no log do servidor.
 * FASE 2: instalar `@neondatabase/serverless`, usar process.env.DATABASE_URL
 * e gravar em leads -> quotes -> quote_items conforme db/schema.sql.
 */
export async function saveQuoteRequest(input: QuoteRequest): Promise<{ id: string; persisted: boolean }> {
  const id = `tmp-${Date.now().toString(36)}`;
  // TODO(fase 2): INSERT no Neon dentro de uma transação.
  console.info("[orcamento] novo pedido", { id, ...input });
  return { id, persisted: false };
}

export async function saveLead(input: Omit<LeadInput, "website">): Promise<{ id: string; persisted: boolean }> {
  const id = `lead-${Date.now().toString(36)}`;
  // TODO(fase 2): INSERT em leads + quotes (status 'novo') no Neon.
  console.info("[lead] novo contato", { id, ...input });
  return { id, persisted: false };
}

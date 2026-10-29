import type { QuoteRequest } from "./quote";
import type { LeadInput } from "./lead";

import { services } from "@/data/services";
import { run, withTransaction } from "@/lib/db";

// Função auxiliar para gerar código MVX-YYYY-NNNN
function generateCode(): string {
  const year = new Date().getFullYear();
  return `MVX-${year}-${String(Math.floor(1000 + Math.random() * 8999)).padStart(4, "0")}`;
}

export async function saveQuoteRequest(input: QuoteRequest): Promise<{ id: string; persisted: boolean }> {
  const id = `tmp-${Date.now().toString(36)}`;

  await withTransaction(async (client) => {
    // 1. Inserir lead
    const leadResult = await client.query<{ id: string }>(
      `INSERT INTO leads (id, name, email, phone, company, source) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id`,
      [input.name, input.email, input.phone, input.company, input.source]
    );
    const leadId = leadResult.rows[0].id;

    // 2. Criar/atualizar client unificado (source='site', intent='conhecer')
    await client.query(
      `INSERT INTO clients (id, name, email, phone, company, source, intent) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'site', 'conhecer')
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         company = EXCLUDED.company,
         source = CASE WHEN clients.source = 'manual' THEN 'manual' ELSE EXCLUDED.source END
       RETURNING id`,
      [input.name, input.email, input.phone, input.company]
    );

    // 3. Gerar código e criar orçamento
    const code = generateCode();
    const quoteResult = await client.query<{ id: string }>(
      `INSERT INTO quotes (id, code, lead_id, status, briefing, budget_range, deadline_pref, total, valid_until) VALUES (gen_random_uuid(), $1, $2, 'novo', $3, $4, $5, 0, CURRENT_DATE + INTERVAL '30 days') RETURNING id`,
      [code, leadId, input.briefing, input.budgetRange, input.deadline]
    );
    const quoteId = quoteResult.rows[0].id;

    // 4. Inserir itens do orçamento
    for (let i = 0; i < input.services.length; i++) {
      const serviceSlug = input.services[i];
      const service = services.find((s) => s.slug === serviceSlug);
      if (!service) continue;

      // Extrair preço numérico de priceFrom (ex: "R$ 1.490" -> 1490)
      const parsePrice = (str?: string): number => {
        if (!str) return 0;
        const num = str.replace(/[^\d.,]/g, "").replace(",", ".");
        return Math.round(parseFloat(num) * 100); // em centavos
      };

      await client.query(
        `INSERT INTO quote_items (id, quote_id, service_id, description, quantity, unit_price, position) VALUES (gen_random_uuid(), $1, gen_random_uuid(), $2, 1, $3, $4)`,
        [quoteId, service.promise ?? "Serviço de desenvolvimento web", parsePrice(service.priceFrom), i + 1]
      );
    }
  });

  return { id, persisted: true };
}

export async function saveLead(input: Omit<LeadInput, "website">): Promise<{ id: string; persisted: boolean }> {
  await run(
    `INSERT INTO leads (id, name, email, phone, company, source) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
    [input.name, null, input.phone, null, input.business]
  );

  return { id: `lead-${Date.now().toString(36)}`, persisted: true };
}
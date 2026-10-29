import { withTransaction } from "./db";
import {
  normalizeLead,
  validateLead,
  tagColor,
  type LeadImportMeta,
  type NormalizedLead,
} from "./lead-import";

export interface LeadImportPreview {
  line: number;
  name: string;
  tier: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  offerCode: string | null;
  recommendedService: string | null;
  tags: string[];
}

export interface LeadImportResult {
  success: number;
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
  dryRun: boolean;
  importId: string | null;
  errors: string[];
  preview: LeadImportPreview[];
}

const INSERT_SQL = `
  INSERT INTO clients (
    id, name, email, phone, phone_e164, company, source, intent,
    import_id, external_id, category, niche, tier, tier_label,
    whatsapp_status, whatsapp_link,
    instagram_handle, instagram_url, instagram_followers,
    website, website_type,
    city, state, neighborhood,
    activity_estimate, google_reviews, google_rating,
    notes, approach_message, sources, objective, recommended_service, offer_code,
    raw_data, updated_at
  ) VALUES (
    gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
    $8, $9, $10, $11, $12, $13,
    $14, $15,
    $16, $17, $18,
    $19, $20,
    $21, $22, $23,
    $24, $25, $26,
    $27, $28, $29::jsonb, $30, $31, $32,
    $33::jsonb, now()
  ) RETURNING id
`;

const UPDATE_SQL = `
  UPDATE clients SET
    name = $1,
    email = COALESCE($2, email),
    phone = $3,
    phone_e164 = $4,
    company = COALESCE($5, company),
    source = $6,
    intent = $7,
    category = $8,
    niche = $9,
    tier = $10,
    tier_label = $11,
    whatsapp_status = $12,
    whatsapp_link = $13,
    instagram_handle = $14,
    instagram_url = $15,
    instagram_followers = $16,
    website = $17,
    website_type = $18,
    city = $19,
    state = $20,
    neighborhood = $21,
    activity_estimate = $22,
    google_reviews = $23,
    google_rating = $24,
    notes = $25,
    approach_message = $26,
    sources = $27::jsonb,
    objective = $28,
    recommended_service = $29,
    offer_code = $30,
    raw_data = $31::jsonb,
    updated_at = now()
  WHERE id = $32
`;

function values(lead: NormalizedLead, importId: string | null): unknown[] {
  return [
    lead.name,
    lead.email,
    lead.phone,
    lead.phoneE164,
    lead.company,
    lead.source,
    lead.intent,
    importId,
    lead.externalId,
    lead.category,
    lead.niche,
    lead.tier,
    lead.tierLabel,
    lead.whatsappStatus,
    lead.whatsappLink,
    lead.instagramHandle,
    lead.instagramUrl,
    lead.instagramFollowers,
    lead.website,
    lead.websiteType,
    lead.city,
    lead.state,
    lead.neighborhood,
    lead.activityEstimate,
    lead.googleReviews,
    lead.googleRating,
    lead.notes,
    lead.approachMessage,
    JSON.stringify(lead.sources),
    lead.objective,
    lead.recommendedService,
    lead.offerCode,
    lead.rawData === undefined ? null : JSON.stringify(lead.rawData),
  ];
}

function updateValues(lead: NormalizedLead): unknown[] {
  return [
    lead.name,
    lead.email,
    lead.phone,
    lead.phoneE164,
    lead.company,
    lead.source,
    lead.intent,
    lead.category,
    lead.niche,
    lead.tier,
    lead.tierLabel,
    lead.whatsappStatus,
    lead.whatsappLink,
    lead.instagramHandle,
    lead.instagramUrl,
    lead.instagramFollowers,
    lead.website,
    lead.websiteType,
    lead.city,
    lead.state,
    lead.neighborhood,
    lead.activityEstimate,
    lead.googleReviews,
    lead.googleRating,
    lead.notes,
    lead.approachMessage,
    JSON.stringify(lead.sources),
    lead.objective,
    lead.recommendedService,
    lead.offerCode,
    lead.rawData === undefined ? null : JSON.stringify(lead.rawData),
  ];
}

/**
 * Importa um lote de leads em uma única transação.
 * Idempotente por (import_id, external_id), telefone E.164 ou e-mail.
 */
export async function importLeadBatch(
  inputs: unknown[],
  meta: LeadImportMeta | null,
  options: { origin?: string; dryRun?: boolean } = {}
): Promise<LeadImportResult> {
  const origin = options.origin ?? "apify";
  const dryRun = options.dryRun === true;
  const errors: string[] = [];
  const preview: LeadImportPreview[] = [];

  const valid: { line: number; lead: NormalizedLead }[] = [];
  inputs.forEach((input, index) => {
    const lead = normalizeLead(input, origin);
    const problems = validateLead(lead);
    if (problems.length > 0) {
      errors.push(`Linha ${index + 1}: ${problems.join("; ")}`);
      return;
    }
    valid.push({ line: index + 1, lead });
    preview.push({
      line: index + 1,
      name: lead.name,
      tier: lead.tier,
      category: lead.category,
      city: lead.city,
      state: lead.state,
      offerCode: lead.offerCode,
      recommendedService: lead.recommendedService,
      tags: lead.tagNames,
    });
  });

  if (dryRun) {
    return {
      success: 0,
      inserted: 0,
      updated: 0,
      skipped: inputs.length - valid.length,
      total: inputs.length,
      dryRun: true,
      importId: null,
      errors,
      preview,
    };
  }

  if (valid.length === 0) {
    return {
      success: 0,
      inserted: 0,
      updated: 0,
      skipped: inputs.length,
      total: inputs.length,
      dryRun: false,
      importId: null,
      errors: errors.length > 0 ? errors : ["Nenhum lead válido encontrado"],
      preview,
    };
  }

  const result = await withTransaction(async (client) => {
    let importId: string | null = null;

    if (meta) {
      const insertedImport = await client.query<{ id: string }>(
        `INSERT INTO lead_imports (title, origin, generated_at, total, meta)
         VALUES ($1, $2, $3::date, $4, $5::jsonb)
         RETURNING id`,
        [meta.title, origin, meta.generatedAt, inputs.length, JSON.stringify(meta.raw)]
      );
      importId = insertedImport.rows[0].id;
    }

    let inserted = 0;
    let updated = 0;

    for (const { line, lead } of valid) {
      try {
        const tagIds = await resolveTagIds(client, lead);
        const existing = await client.query<{ id: string }>(
          `SELECT id FROM clients
           WHERE ($1::uuid IS NOT NULL AND import_id = $1 AND external_id = $2)
              OR ($3 <> '' AND phone_e164 = $3)
              OR ($4 <> '' AND lower(email) = lower($4))
           LIMIT 1`,
          [importId, lead.externalId, lead.phoneE164 ?? "", lead.email ?? ""]
        );

        let clientId: string;
        if (existing.rows.length > 0) {
          clientId = existing.rows[0].id;
          await client.query(UPDATE_SQL, [...updateValues(lead), clientId]);
          updated++;
        } else {
          const created = await client.query<{ id: string }>(
            INSERT_SQL,
            values(lead, importId)
          );
          clientId = created.rows[0].id;
          inserted++;
        }

        for (const tagId of tagIds) {
          await client.query(
            `INSERT INTO client_tags (client_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [clientId, tagId]
          );
        }
      } catch (err) {
        errors.push(
          `Linha ${line} (${lead.name}): ${err instanceof Error ? err.message : "erro desconhecido"}`
        );
      }
    }

    if (importId) {
      await client.query(
        `UPDATE lead_imports SET imported = $2, updated = $3 WHERE id = $1`,
        [importId, inserted, updated]
      );
    }

    return { inserted, updated, importId };
  });

  const skipped = inputs.length - valid.length + (valid.length - result.inserted - result.updated);

  return {
    success: result.inserted + result.updated,
    inserted: result.inserted,
    updated: result.updated,
    skipped,
    total: inputs.length,
    dryRun: false,
    importId: result.importId,
    errors,
    preview,
  };
}

async function resolveTagIds(
  client: {
    query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  },
  lead: NormalizedLead
): Promise<string[]> {
  const names = Array.from(new Set(lead.tagNames));
  const ids: string[] = [...lead.tagIds];

  if (names.length > 0) {
    const found = await client.query<{ id: string; name: string }>(
      `SELECT id, name FROM tags WHERE name = ANY($1::text[])`,
      [names]
    );
    const byName = new Map(found.rows.map((row) => [row.name, row.id]));
    const missing = names.filter((name) => !byName.has(name));

    for (const name of missing) {
      const created = await client.query<{ id: string }>(
        `INSERT INTO tags (name, color) VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [name, tagColor(name)]
      );
      byName.set(name, created.rows[0].id);
    }

    for (const name of names) {
      const id = byName.get(name);
      if (id) ids.push(id);
    }
  }

  return Array.from(new Set(ids));
}

-- ============================================================
-- Fase 3: enriquecimento de leads (importações Apify / prospecção)
-- Executar no Neon: psql $DATABASE_URL -f db/migrations/003_lead_enrichment.sql
-- ============================================================

-- ---------- Lotes de importação ----------
CREATE TABLE IF NOT EXISTS lead_imports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text,
  origin        text NOT NULL DEFAULT 'apify',   -- apify | manual | xlsx
  generated_at  date,
  total         int NOT NULL DEFAULT 0,
  imported      int NOT NULL DEFAULT 0,
  updated       int NOT NULL DEFAULT 0,
  meta          jsonb NOT NULL DEFAULT '{}'::jsonb, -- meta original do arquivo (filtros, avisos, runs)
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lead_imports_created_idx ON lead_imports (created_at DESC);

-- ---------- Campos enriquecidos do cliente/lead ----------
ALTER TABLE clients ADD COLUMN IF NOT EXISTS import_id uuid REFERENCES lead_imports(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS external_id text;          -- id do lead no arquivo de origem
ALTER TABLE clients ADD COLUMN IF NOT EXISTS category text;             -- ex.: Odontologia
ALTER TABLE clients ADD COLUMN IF NOT EXISTS niche text;                -- ex.: Implantodontia
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tier text;                 -- A | B
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tier_label text;           -- "A – Site (R$ 400+)"
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone_e164 text;           -- +5521...
ALTER TABLE clients ADD COLUMN IF NOT EXISTS whatsapp_status text;      -- confirmado | provavel | nao_identificado
ALTER TABLE clients ADD COLUMN IF NOT EXISTS whatsapp_link text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS instagram_handle text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS instagram_followers int;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website text;              -- URL ou descrição original do site
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website_type text;         -- nosite | igonly | link | template | site_ig | site_noig
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS state text;                -- UF
ALTER TABLE clients ADD COLUMN IF NOT EXISTS neighborhood text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS activity_estimate text;    -- tempo de atividade estimado (texto original)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_reviews int;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_rating numeric(2,1);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes text;                -- observação original do lead
ALTER TABLE clients ADD COLUMN IF NOT EXISTS approach_message text;     -- mensagem de abordagem sugerida
ALTER TABLE clients ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS objective text;            -- objetivo comercial derivado da faixa
ALTER TABLE clients ADD COLUMN IF NOT EXISTS recommended_service text;  -- oferta recomendada (texto)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS offer_code text;           -- código da oferta para filtros/campanhas
ALTER TABLE clients ADD COLUMN IF NOT EXISTS raw_data jsonb;            -- payload original completo (sem perdas)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ---------- Índices ----------
-- Um lead por (lote, id externo) e telefone único quando conhecido.
CREATE UNIQUE INDEX IF NOT EXISTS clients_import_external_idx
  ON clients (import_id, external_id)
  WHERE import_id IS NOT NULL AND external_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS clients_phone_e164_idx
  ON clients (phone_e164)
  WHERE phone_e164 IS NOT NULL;

CREATE INDEX IF NOT EXISTS clients_import_idx ON clients (import_id);
CREATE INDEX IF NOT EXISTS clients_category_idx ON clients (category);
CREATE INDEX IF NOT EXISTS clients_tier_idx ON clients (tier);
CREATE INDEX IF NOT EXISTS clients_city_idx ON clients (city);
CREATE INDEX IF NOT EXISTS clients_website_type_idx ON clients (website_type);
CREATE INDEX IF NOT EXISTS clients_offer_code_idx ON clients (offer_code);

-- Busca textual por bairro/categoria sem depender de ILIKE em coluna isolada.
CREATE INDEX IF NOT EXISTS clients_name_trgm_idx ON clients (lower(name));

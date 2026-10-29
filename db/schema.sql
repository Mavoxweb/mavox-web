-- Mavox: modelo de dados do futuro sistema de orçamentos (Neon / PostgreSQL)
-- Execute no console do Neon quando iniciarmos a fase 2.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Catálogo de serviços (espelha src/data/services.ts; passa a ser editável no painel)
CREATE TABLE services (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  name          text NOT NULL,
  description   text,
  base_price    numeric(12,2),            -- preço-base interno (não exibido no site)
  est_days_min  int,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Quem pede orçamento
CREATE TABLE leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  company     text,
  source      text,                        -- utm_source / origem
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_email_idx ON leads (email);

-- Pedido de orçamento vindo do site
CREATE TYPE quote_status AS ENUM ('novo','em_analise','proposta_enviada','aprovado','recusado','expirado');

CREATE TABLE quotes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text UNIQUE,               -- ex.: MVX-2026-0001
  lead_id       uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status        quote_status NOT NULL DEFAULT 'novo',
  briefing      text,
  budget_range  text,
  deadline_pref text,
  total         numeric(12,2),
  valid_until   date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX quotes_status_idx ON quotes (status);

-- Itens do orçamento / proposta
CREATE TABLE quote_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id    uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  service_id  uuid REFERENCES services(id),
  description text NOT NULL,
  quantity    int NOT NULL DEFAULT 1,
  unit_price  numeric(12,2),
  position    int NOT NULL DEFAULT 0
);

-- Propostas geradas (link público + PDF)
CREATE TABLE proposals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id    uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  version     int NOT NULL DEFAULT 1,
  public_token text UNIQUE NOT NULL,       -- link /proposta/[token]
  content     jsonb NOT NULL,              -- escopo, cronograma, condições
  sent_at     timestamptz,
  viewed_at   timestamptz,
  accepted_at timestamptz
);

-- Linha do tempo / organização interna
CREATE TABLE quote_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id   uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  type       text NOT NULL,                -- status_change | nota | email | whatsapp | proposta_visualizada
  data       jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===========================================
-- TABELAS ADICIONAIS - FASE 2.2 (CRM, Blog, Agenda, Tags, Follow-up)
-- ===========================================

-- Clientes unificados (site + externos inseridos manualmente)
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  company text,
  source text DEFAULT 'manual', -- 'site' | 'manual'
  intent text DEFAULT 'conhecer', -- 'conhecer' | 'avaliando' | 'pronto_para_contratar'
  created_at timestamptz DEFAULT now()
);
CREATE INDEX clients_email_idx ON clients (email);
CREATE INDEX clients_source_idx ON clients (source);
CREATE INDEX clients_intent_idx ON clients (intent);

-- Tags de segmentação
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE client_tags (
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id, tag_id)
);

-- Blog
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  status text DEFAULT 'draft', -- draft | published | scheduled
  published_at timestamptz,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX posts_status_idx ON posts (status);
CREATE INDEX posts_slug_idx ON posts (slug);
CREATE INDEX posts_published_at_idx ON posts (published_at);

-- Agenda (groundwork para Google Meet futuro)
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  google_event_id text,
  meet_link text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX appointments_client_idx ON appointments (client_id);
CREATE INDEX appointments_starts_idx ON appointments (starts_at);

-- Follow-up / funil
CREATE TABLE followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  stage text NOT NULL,
  message text NOT NULL,
  sent_at timestamptz,
  channel text DEFAULT 'whatsapp',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX followups_quote_idx ON followups (quote_id);
CREATE INDEX followups_stage_idx ON followups (stage);

-- Pixels de conversão
CREATE TABLE pixel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- 'visita', 'clique_whatsapp', 'envio_orcamento', 'proposta_aceita'
  pixel_id_meta text,
  pixel_id_google text,
  created_at timestamptz DEFAULT now()
);

-- Configurações globais
CREATE TABLE settings (
  id int PRIMARY KEY DEFAULT 1,
  openrouter_api_key text,
  company_name text,
  company_email text,
  company_phone text,
  company_address text,
  whatsapp_number text,
  meta_pixel_id text,
  google_ads_id text,
  -- SMTP (Fase 2)
  smtp_host text,
  smtp_port int DEFAULT 587,
  smtp_user text,
  smtp_password text,
  smtp_secure boolean DEFAULT false,
  smtp_from_name text,
  smtp_from_email text,
  -- IA (Fase 2)
  ai_models jsonb NOT NULL DEFAULT '{}'::jsonb,
  daily_agent_model text,
  daily_agent_enabled boolean NOT NULL DEFAULT true,
  daily_agent_last_run timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Templates de e-mail (Fase 2)
CREATE TABLE email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Logs de envio de e-mail (Fase 2)
CREATE TABLE email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  template_key text,
  status text NOT NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Oportunidades do agente diário (Fase 2)
CREATE TABLE ai_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'geral',
  priority text NOT NULL DEFAULT 'media',
  related_type text,
  related_id uuid,
  action_url text,
  action_label text,
  source text NOT NULL DEFAULT 'regra',
  status text NOT NULL DEFAULT 'aberta',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices adicionais para performance
CREATE INDEX proposals_token_idx ON proposals (public_token);
CREATE INDEX proposals_quote_idx ON proposals (quote_id);
CREATE INDEX quote_events_quote_idx ON quote_events (quote_id);
CREATE INDEX email_logs_created_idx ON email_logs (created_at DESC);
CREATE INDEX email_logs_status_idx ON email_logs (status);
CREATE INDEX ai_opportunities_run_idx ON ai_opportunities (run_date DESC);
CREATE INDEX ai_opportunities_status_idx ON ai_opportunities (status);

-- ============================================================
-- Fase 3: enriquecimento de leads (ver db/migrations/003)
-- ============================================================

CREATE TABLE lead_imports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text,
  origin        text NOT NULL DEFAULT 'apify',
  generated_at  date,
  total         int NOT NULL DEFAULT 0,
  imported      int NOT NULL DEFAULT 0,
  updated       int NOT NULL DEFAULT 0,
  meta          jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lead_imports_created_idx ON lead_imports (created_at DESC);

ALTER TABLE clients ADD COLUMN import_id uuid REFERENCES lead_imports(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN external_id text;
ALTER TABLE clients ADD COLUMN category text;
ALTER TABLE clients ADD COLUMN niche text;
ALTER TABLE clients ADD COLUMN tier text;
ALTER TABLE clients ADD COLUMN tier_label text;
ALTER TABLE clients ADD COLUMN phone_e164 text;
ALTER TABLE clients ADD COLUMN whatsapp_status text;
ALTER TABLE clients ADD COLUMN whatsapp_link text;
ALTER TABLE clients ADD COLUMN instagram_handle text;
ALTER TABLE clients ADD COLUMN instagram_url text;
ALTER TABLE clients ADD COLUMN instagram_followers int;
ALTER TABLE clients ADD COLUMN website text;
ALTER TABLE clients ADD COLUMN website_type text;
ALTER TABLE clients ADD COLUMN city text;
ALTER TABLE clients ADD COLUMN state text;
ALTER TABLE clients ADD COLUMN neighborhood text;
ALTER TABLE clients ADD COLUMN activity_estimate text;
ALTER TABLE clients ADD COLUMN google_reviews int;
ALTER TABLE clients ADD COLUMN google_rating numeric(2,1);
ALTER TABLE clients ADD COLUMN notes text;
ALTER TABLE clients ADD COLUMN approach_message text;
ALTER TABLE clients ADD COLUMN sources jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE clients ADD COLUMN objective text;
ALTER TABLE clients ADD COLUMN recommended_service text;
ALTER TABLE clients ADD COLUMN offer_code text;
ALTER TABLE clients ADD COLUMN raw_data jsonb;
ALTER TABLE clients ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX clients_import_external_idx ON clients (import_id, external_id)
  WHERE import_id IS NOT NULL AND external_id IS NOT NULL;
CREATE UNIQUE INDEX clients_phone_e164_idx ON clients (phone_e164)
  WHERE phone_e164 IS NOT NULL;
CREATE INDEX clients_import_idx ON clients (import_id);
CREATE INDEX clients_category_idx ON clients (category);
CREATE INDEX clients_tier_idx ON clients (tier);
CREATE INDEX clients_city_idx ON clients (city);
CREATE INDEX clients_website_type_idx ON clients (website_type);
CREATE INDEX clients_offer_code_idx ON clients (offer_code);
CREATE INDEX clients_name_trgm_idx ON clients (lower(name));

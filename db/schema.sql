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
  updated_at timestamptz DEFAULT now()
);

-- Índices adicionais para performance
CREATE INDEX proposals_token_idx ON proposals (public_token);
CREATE INDEX proposals_quote_idx ON proposals (quote_id);
CREATE INDEX quote_events_quote_idx ON quote_events (quote_id);
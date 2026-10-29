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
  type       text NOT NULL,                -- status_change | nota | email | whatsapp
  data       jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

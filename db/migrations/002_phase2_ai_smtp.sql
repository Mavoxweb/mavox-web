-- ============================================================
-- Fase 2: SMTP, templates de e-mail, logs, modelos de IA e
-- agente diário de oportunidades
-- Executar no Neon: psql $DATABASE_URL -f db/migrations/002_phase2_ai_smtp.sql
-- ============================================================

-- ---------- settings: SMTP ----------
ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_host text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_port int DEFAULT 587;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_user text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_password text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_secure boolean DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_from_name text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_from_email text;

-- ---------- settings: IA ----------
ALTER TABLE settings ADD COLUMN IF NOT EXISTS ai_models jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS daily_agent_model text;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS daily_agent_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS daily_agent_last_run timestamptz;

-- ---------- Templates de e-mail ----------
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,          -- proposta | cold_outreach | followup | onboarding | cobranca
  name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Logs de envio ----------
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  template_key text,
  status text NOT NULL,              -- sent | error
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_logs_created_idx ON email_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS email_logs_status_idx ON email_logs (status);

-- ---------- Oportunidades geradas pelo agente diário ----------
CREATE TABLE IF NOT EXISTS ai_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'geral',   -- orcamento | lead | followup | reuniao | cliente | geral
  priority text NOT NULL DEFAULT 'media',   -- alta | media | baixa
  related_type text,                        -- quote | client | lead | appointment
  related_id uuid,
  action_url text,
  action_label text,
  source text NOT NULL DEFAULT 'regra',     -- ai | regra
  status text NOT NULL DEFAULT 'aberta',    -- aberta | concluida | descartada
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_opportunities_run_idx ON ai_opportunities (run_date DESC);
CREATE INDEX IF NOT EXISTS ai_opportunities_status_idx ON ai_opportunities (status);

-- ---------- Alinhamento: followups.created_at (drift do banco) ----------
ALTER TABLE followups ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

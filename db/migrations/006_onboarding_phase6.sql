-- FASE 6 — Onboarding de Clientes (Novo Módulo Completo)

CREATE TABLE IF NOT EXISTS client_onboardings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) UNIQUE,
  quote_id uuid REFERENCES quotes(id),
  status text NOT NULL DEFAULT 'briefing' CHECK (status IN ('briefing', 'kickoff', 'setup', 'implementation', 'quickstart', 'active')),
  contract_signed_at timestamptz,
  contract_value numeric(12,2),
  contract_duration_months int,
  contract_file_url text,
  quickstart_target_date date,
  quickstart_completed_at timestamptz,
  squad_lead_id uuid,
  squad_members uuid[] DEFAULT '{}',
  briefing_data jsonb DEFAULT '{}',
  accesses jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_client_onboardings_client ON client_onboardings (client_id);
CREATE INDEX IF NOT EXISTS idx_client_onboardings_status ON client_onboardings (status);

CREATE TABLE IF NOT EXISTS onboarding_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid REFERENCES client_onboardings(id) ON DELETE CASCADE,
  stage_key text NOT NULL CHECK (stage_key IN ('briefing', 'kickoff', 'accesses', 'setup', 'implementation', 'quickstart')),
  title text NOT NULL DEFAULT '',
  order_num int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  completed_by uuid,
  notes text DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_onboarding_stages_onboarding ON onboarding_stages (onboarding_id);

CREATE TABLE IF NOT EXISTS client_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  onboarding_id uuid REFERENCES client_onboardings(id),
  due_date date,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late', 'partial')),
  paid_at timestamptz,
  payment_method text DEFAULT '',
  invoice_url text,
  interest_applied numeric(12,2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_client_payments_client ON client_payments (client_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_due ON client_payments (due_date);
CREATE INDEX IF NOT EXISTS idx_client_payments_status ON client_payments (status);

CREATE TABLE IF NOT EXISTS client_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  period_start date,
  period_end date,
  metrics jsonb DEFAULT '{}',
  file_url text,
  generated_at timestamptz,
  sent_to_client_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_client_reports_client ON client_reports (client_id);

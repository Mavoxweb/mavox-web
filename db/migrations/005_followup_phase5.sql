-- FASE 5 — Follow-up Automático (Motor Inteligente)
CREATE TABLE IF NOT EXISTS followup_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger_type text NOT NULL CHECK (trigger_type IN ('no_response', 'stage_stale', 'contract_pending', 'meeting_needed', 're_engage')),
  trigger_config jsonb NOT NULL DEFAULT '{}',
  message_template text NOT NULL DEFAULT '',
  channel text NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'sms')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_followup_rules_active ON followup_rules (active);
CREATE INDEX IF NOT EXISTS idx_followup_rules_trigger ON followup_rules (trigger_type);

CREATE TABLE IF NOT EXISTS followup_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES followup_rules(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'replied', 'failed', 'skipped')),
  channel text NOT NULL DEFAULT 'whatsapp',
  message_sent text,
  response_received boolean DEFAULT false,
  executed_at timestamptz,
  response_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_followup_executions_status ON followup_executions (status);
CREATE INDEX IF NOT EXISTS idx_followup_executions_lead ON followup_executions (lead_id);
CREATE INDEX IF NOT EXISTS idx_followup_executions_rule ON followup_executions (rule_id);

CREATE TABLE IF NOT EXISTS lead_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'quote_created', 'proposal_sent', 'proposal_viewed', 'whatsapp_sent',
    'email_sent', 'meeting_scheduled', 'contract_signed', 'payment_received',
    'note_added', 'stage_changed', 'lost_reason', 're_engaged'
  )),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_timeline_lead ON lead_timeline (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_timeline_type ON lead_timeline (type);
CREATE INDEX IF NOT EXISTS idx_lead_timeline_created ON lead_timeline (created_at DESC);

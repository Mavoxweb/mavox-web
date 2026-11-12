-- API v1 para integrações externas (bots/agentes): chaves por integração, com escopos e revogação.
-- A chave em texto puro nunca é guardada: apenas o hash SHA-256.
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys (key_hash) WHERE revoked_at IS NULL;

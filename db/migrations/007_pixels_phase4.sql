-- Fase 4: Pixels & Analytics - Adição de campos GTM/GA4/TikTok + Meta CAPI + Log de eventos

-- 1. Adicionar campos à tabela settings
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS gtm_id text,
  ADD COLUMN IF NOT EXISTS ga4_measurement_id text,
  ADD COLUMN IF NOT EXISTS tiktok_pixel_id text,
  ADD COLUMN IF NOT EXISTS meta_capi_access_token text,
  ADD COLUMN IF NOT EXISTS meta_capi_pixel_id text;

-- 2. Adicionar campo tiktok na tabela pixel_events
ALTER TABLE pixel_events
  ADD COLUMN IF NOT EXISTS pixel_id_tiktok text;

-- 3. Criar tabela pixel_event_logs (log persistente para debug/validador)
CREATE TABLE IF NOT EXISTS pixel_event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  pixel_type text NOT NULL, -- 'gtm', 'ga4', 'meta_pixel', 'meta_capi', 'tiktok'
  pixel_id text,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  event_id text, -- para deduplicação (Meta CAPI)
  user_agent text,
  ip_hash text,
  status text NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'deduplicated'
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pixel_event_logs_created_idx ON pixel_event_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS pixel_event_logs_event_idx ON pixel_event_logs (event_name);
CREATE INDEX IF NOT EXISTS pixel_event_logs_type_idx ON pixel_event_logs (pixel_type);
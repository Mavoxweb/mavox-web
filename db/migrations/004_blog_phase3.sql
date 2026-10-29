-- Fase 3 — Blog & Conteúdo
-- Campos de SEO, agendamento e mídia para o editor rico.

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS agent text NOT NULL DEFAULT 'blog_writer',
  ADD COLUMN IF NOT EXISTS cta_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS scheduled_timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS posts_updated_at_idx ON posts (updated_at);

-- Fallback de mídia quando o Neon Object Storage não está disponível na região
-- do projeto. A rota /api/media/[key] serve os bytes com cache imutável.
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_key text UNIQUE NOT NULL,
  filename text NOT NULL,
  content_type text NOT NULL,
  size_bytes integer NOT NULL,
  data bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_assets_created_at_idx ON media_assets (created_at);

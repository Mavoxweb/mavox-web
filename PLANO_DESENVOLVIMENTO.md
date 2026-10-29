# PLANO DE DESENVOLVIMENTO — MAVOX WEB (Painel Administrativo + CRM + Funil + Blog IA)

**Versão:** 1.0  
**Stack:** Next.js 15 (App Router) + Tailwind CSS v4 + TypeScript + Neon PostgreSQL + Neon Auth + Vercel  
**Rotas:** `/painel/*` (administrativo), `/blog/[slug]` (público SEO), `/proposta/[token]` (público orçamento)

---

## FASE 2 — Fundação: Banco de Dados Neon + Neon Auth

### 2.1. Aplicar schema SQL no Neon
Executar `db/schema.sql` no branch do Neon. Tabelas base:
- `services` — catálogo de serviços (espelha `src/data/services.ts`, editável no painel)
- `leads` — quem pede orçamento via site
- `quotes` — pedidos de orçamento (status: novo, em_analise, proposta_enviada, aprovado, recusado, expirado)
- `quote_items` — itens do orçamento
- `proposals` — propostas geradas com `public_token` (link único `/proposta/[token]`)
- `quote_events` — linha do tempo interna (status_change, nota, email, whatsapp)

### 2.2. Tabelas adicionais (CRM, Blog, Agenda, Tags, Follow-up)

```sql
-- Usuários do painel (Neon Auth)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

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

-- Tags de segmentação
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text
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

-- Follow-up / funil
CREATE TABLE followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  stage text NOT NULL,
  message text NOT NULL,
  sent_at timestamptz,
  channel text DEFAULT 'whatsapp'
);

-- Pixels de conversão
CREATE TABLE pixel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- 'visita', 'clique_whatsapp', 'envio_orcamento', 'proposta_aceita'
  pixel_id_meta text,
  pixel_id_google text,
  created_at timestamptz DEFAULT now()
);
```

### 2.3. Conectar APIs existentes ao Neon
- Instalar `@neondatabase/serverless`
- Substituir `console.log` em `src/lib/quote-repository.ts` por INSERTs reais (transação: `leads` → `quotes` → `quote_items`)
- Conectar `src/app/api/orcamentos/route.ts` ao banco
- Criar `.env` com `DATABASE_URL`, `NEXTAUTH_SECRET` (ou equivalente Neon Auth)

---

## FASE 3 — Neon Auth + Painel Administrativo (`/painel/*`)

### 3.1. Configurar Neon Auth
- Habilitar auth provider no branch do Neon
- Criar usuário admin via seed (email e senha definidos pelo usuário, role `root`)
- Middleware protegendo rotas `/painel/*`

### 3.2. Estrutura de rotas do painel
```
/painel/login
/painel/dashboard
/painel/clients
/painel/clients/new
/painel/clients/[id]
/painel/quotes
/painel/quotes/[id]
/painel/tags
/painel/blog
/painel/blog/new
/painel/blog/[id]
/painel/appointments
/painel/pixels
/painel/followups
/painel/settings
```

### 3.3. Páginas e funcionalidades do painel

| Página | Funcionalidade |
|--------|---------------|
| `/painel/login` | Login email/senha (usuário root via seed) |
| `/painel/dashboard` | Visão geral: leads hoje, orçamentos pendentes, propostas enviadas, taxa de conversão, cards de métricas |
| `/painel/clients` | Lista de clientes (site + externos), busca, filtro por `source`, `intent`, `tags` |
| `/painel/clients/new` | Cadastro manual de cliente externo |
| `/painel/clients/[id]` | Detalhe do cliente, histórico de orçamentos, tags vinculadas, funil de intenção |
| `/painel/quotes` | **Kanban** (padrão) com opção de **lista**: colunas por status (novo → em análise → proposta enviada → aprovado → recusado → expirado). Cartões arrastáveis entre colunas. Alternância Kanban ↔ Lista via toggle. |
| `/painel/quotes/[id]` | Detalhe do orçamento: itens, valores, descontos, quantidade, histórico de eventos (`quote_events`), botão enviar WhatsApp, botão gerar PDF, botão marcar como aprovado/recusado |
| `/painel/tags` | CRUD de tags (nome, cor), vinculação a clientes |
| `/painel/blog` | Lista de posts (rascunho, publicado, agendado), busca, filtro por status |
| `/painel/blog/new` | Editor de posts: título, slug, conteúdo, excerpt, status, data de publicação agendada, botão "Gerar com IA" |
| `/painel/blog/[id]` | Edição de post existente |
| `/painel/appointments` | Agenda manual (groundwork Google Meet): criar, editar, excluir reuniões com cliente, data/hora, link do Meet (campo texto manual inicialmente) |
| `/painel/pixels` | Mapeamento de IDs do Google Ads e Meta Ads por evento de conversão (visita, clique WhatsApp, envio orçamento, proposta aceita) |
| `/painel/followups` | Configuração de mensagens automáticas por estágio do funil (canal: whatsapp via link `wa.me`) |
| `/painel/settings` | Configurações gerais: OpenRouter API key, domínio, informações da empresa |

---

## FASE 4 — Sistema de Orçamentos Avançado (Link Único + Persuasivo)

### 4.1. Página pública da proposta
- Rota: `/proposta/[public_token]` — sem login, acessível por qualquer pessoa com o link
- Design persuasivo: cores da Mavox, tipografia clara, prova social, call-to-action
- Detalhamento de serviços: cada item com descrição, prazo, o que inclui
- Controle de valores: preço unitário, quantidade, desconto (percentual ou valor fixo)
- Interatividade do cliente: pode aumentar/diminuir quantidade de serviços (recalcula total em tempo real no frontend)
- Botão: "Aceitar proposta" → muda status para `aprovado` e dispara evento no painel

### 4.2. Geração de PDF
- Biblioteca: `pdfmake` (funciona server-side no Next.js, sem dependência de canvas/browser)
- Exportar proposta em PDF com branding da Mavox (logo, cores, dados do cliente, itens, valores, assinatura)

### 4.3. Disparo WhatsApp
- Botão no painel: "Enviar proposta por WhatsApp"
- Abre `wa.me/{telefone}?text=...` com link da proposta `/proposta/[token]` e mensagem personalizada

---

## FASE 5 — Blog + IA (OpenRouter) — Público: `/blog/[slug]`

### 5.1. Blog público no site
- Página `/blog` — lista de artigos publicados (cartões com imagem, título, excerpt, data)
- Página `/blog/[slug]` — artigo individual, otimizado para SEO (meta tags, Open Graph, JSON-LD Article)
- Sitemap e robots atualizados automaticamente com novos posts

### 5.2. CMS no painel (`/painel/blog`)
- Criar/editar/excluir artigos
- Status: `draft` | `published` | `scheduled`
- Data de publicação agendável
- Campo para inserir trending topic do X (Twitter) manualmente

### 5.3. Geração de texto via IA (OpenRouter)
- Integração com OpenRouter API (chave configurada em `/painel/settings`)
- Fluxo: usuário insere trending topic → IA recebe: topic + dados da Mavox + objetivo de venda → gera texto otimizado para SEO e conversão
- Botão "Gerar com IA" no editor de posts (preenche conteúdo automaticamente)
- Marcar post como `ai_generated = true`

### 5.4. Agendamento de publicação
- Groundwork para Vercel Cron (publicação automática em data/hora futura)
- Post com status `scheduled` fica invisível no público até a data definida

---

## FASE 6 — Follow-up Automatizado + Pixels + Funil de Segmentação

### 6.1. Segmentação de clientes por intenção de compra
- Campo `intent` na tabela `clients`: `conhecer` | `avaliando` | `pronto_para_contratar`
- Filtro no painel: visualizar apenas clientes prontos para contratar
- Tags para segmentação adicional (ex.: "urgente", "retorno", "pequeno porte")

### 6.2. Follow-up automatizado por estágio do funil
- Tabela `followups` com mensagem por estágio
- Gatilhos:
  - Proposta visualizada (cliente abriu `/proposta/[token]`)
  - Proposta aceita
  - Orçamento recusado
  - Lead inativo há X dias sem resposta
- Envio inicial via link `wa.me` (clique manual). Groundwork para Evolution API depois.

### 6.3. Gestão de pixels de conversão
- Painel `/painel/pixels` para cadastrar:
  - ID do Meta Pixel
  - ID do Google Ads / Google Analytics
- Eventos mapeados: visita página, clique WhatsApp, envio de orçamento, proposta aceita
- Cada botão importante do site marcado com evento configurável pelo painel
- Disparo automático via `gtag` / `fbq` com base nas configurações do painel

---

## FASE 7 — Agenda e Reuniões (Google Meet — Groundwork)

### 7.1. Agenda manual (fase atual)
- Calendário visual no painel `/painel/appointments`
- Criar reunião com cliente, título, data/hora início/fim
- Campo `meet_link` preenchido manualmente (usuário cola o link do Google Meet)

### 7.2. Preparação para integração futura
- Tabela `appointments` já possui campos `google_event_id` e `meet_link`
- Estrutura pronta para OAuth do Google Calendar API quando o usuário quiser ativar
- Link de agendamento público (groundwork): cliente pode agendar direto da página da proposta

---

## Recursos a preparar (credenciais/chaves)

| Recurso | Para quê | Fase |
|---------|----------|------|
| Neon `DATABASE_URL` | Conexão banco | 2 |
| Neon Auth (provider habilitado) | Login do painel | 3 |
| Email + senha do usuário root | Definido pelo usuário via seed | 3 |
| OpenRouter API key | Geração de textos IA no blog | 5 |
| Meta Pixel ID | Rastreamento Meta Ads | 6 |
| Google Ads / GA4 ID | Rastreamento Google Ads | 6 |
| Google Cloud Console (OAuth) | Integração Google Meet futura | 7 (preparar terreno) |
| Evolution API | Automação WhatsApp futura | Depois do MVP |

---

## Regras de negócio resumidas

1. **Todos os leads do site** virão automaticamente registros em `clients` com `source = 'site'` e `intent = 'conhecer'`.
2. **Clientes externos** são cadastrados manualmente no painel com `source = 'manual'`.
3. **Qualificação** muda o `intent` conforme o lead avança no funil (painel ou interação).
4. **Cada orçamento** gera um `public_token` único → link público `/proposta/[token]`.
5. **PDF** é gerado server-side e pode ser baixado ou enviado via WhatsApp.
6. **Blog público** fica em `/blog/[slug]`, otimizado para SEO. CMS fica em `/painel/blog`.
7. **IA** escreve rascunhos baseados em trending topics inseridos manualmente; humano revisa antes de publicar.
8. **Pixels** são configurados pelo painel e disparam automaticamente nos eventos mapeados.

---

## Ordem recomendada de execução

1. **Fase 2** — Schema SQL no Neon + conectar API existente
2. **Fase 3** — Neon Auth + painel administrativo (clientes, orçamentos kanban/lista)
3. **Fase 4** — Link público da proposta + PDF + WhatsApp
4. **Fase 5** — Blog público + CMS + IA (OpenRouter)
5. **Fase 6** — Follow-up + pixels + segmentação por intenção
6. **Fase 7** — Agenda manual + groundwork Google Meet

---

## Perguntas pendentes (respostas já definidas pelo usuário)

- **Funil:** Kanban padrão, com opção de lista via toggle ✅
- **PDF:** `pdfmake` ✅
- **Usuário root:** Via seed, credenciais definidas pelo usuário ✅
- **Ordem:** Painel primeiro, blog depois ✅
- **Rotas:** `/painel/*` admin, `/blog/[slug]` público ✅
- **WhatsApp:** Links `wa.me` inicialmente, Evolution API depois ✅
- **Trending topics:** Inserção manual no painel ✅
- **Google Meet:** Agendamento manual inicialmente, integração OAuth depois ✅

---

**Próximo passo:** Iniciar a codificação pela **Fase 2** (aplicar schema no Neon + conectar API existente).
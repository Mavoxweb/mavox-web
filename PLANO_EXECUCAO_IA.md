# PLANO DE EXECUÇÃO PARA IA — MAVOX WEB

> **Documento gerado automaticamente** para guiar a implementação das pendências identificadas na análise do código vs PLANO_DESENVOLVIMENTO.md
> **Data:** 2026-10-29
> **Versão:** 1.0

---

## 🎯 OBJETIVO

Transformar o projeto MAVOX-WEB de "funcionando em desenvolvimento" para **"pronto para produção"** resolvendo todos os gaps críticos, bugs e funcionalidades incompletas.

---

## 📊 RESUMO EXECUTIVO

| Categoria | Total | Crítico | Alto | Médio |
|-----------|-------|---------|------|-------|
| **Tarefas** | 26 | 5 | 10 | 11 |
| **Tabelas SQL faltando** | 8 | 8 | - | - |
| **Bugs identificados** | 6 | 2 | 2 | 2 |

---

## 🔴 FASE 0 — PRÉ-REQUISITOS CRÍTICOS (BLOQUEIAM PRODUÇÃO)

### T0.1 — Aplicar Schema SQL Completo no Neon
**Arquivo:** `db/schema.sql` (precisa ser expandido)
**Ação:** Adicionar todas as tabelas da Fase 2.2 do plano original que estão **faltando**:

```sql
-- TABELAS FALTANDO (já referenciadas nas APIs mas não existem no schema.sql):

-- 1. Clientes unificados (site + manual)
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

-- 2. Tags de segmentação
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

-- 3. Blog
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

-- 4. Agenda (groundwork Google Meet)
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

-- 5. Follow-up / funil
CREATE TABLE followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  stage text NOT NULL,
  message text NOT NULL,
  sent_at timestamptz,
  channel text DEFAULT 'whatsapp'
);

-- 6. Pixels de conversão
CREATE TABLE pixel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- 'visita', 'clique_whatsapp', 'envio_orcamento', 'proposta_aceita'
  pixel_id_meta text,
  pixel_id_google text,
  created_at timestamptz DEFAULT now()
);

-- 7. Configurações globais
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
```

**Comando:** Executar no console do Neon (SQL Editor) ou via `neon sql < schema.sql`

---

### T0.2 — Criar Middleware de Proteção `/painel/*`
**Arquivo novo:** `src/middleware.ts`
**Dependência:** `jose` (já instalado), `neon_auth` tables

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "mavox-dev-secret-change-in-production"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger apenas rotas do painel admin
  if (pathname.startsWith("/painel") || pathname.startsWith("/api/painel")) {
    // Permitir login page
    if (pathname === "/login" || pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get("mavox_session")?.value;

    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const session = JSON.parse(sessionCookie);
      // Verificar se usuário existe no Neon Auth
      // Opcional: validar com banco se necessário
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", session.userId);
      requestHeaders.set("x-user-email", session.email);
      requestHeaders.set("x-user-role", session.role || "admin");

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*", "/api/painel/:path*"],
};
```

**Variável de ambiente necessária:** `SESSION_SECRET` no `.env`

---

### T0.3 — Script de Seed para Usuário Root (Neon Auth)
**Arquivo novo:** `scripts/seed-admin.ts` ou SQL direto no Neon

```sql
-- Executar no Neon SQL Editor APÓS habilitar Neon Auth no branch:
-- 1. Criar usuário na tabela neon_auth.user
-- 2. Criar conta email/password na neon_auth.account

-- Exemplo (ajustar email/senha):
INSERT INTO neon_auth.user (id, email, name, role, created_at)
VALUES (gen_random_uuid(), 'admin@mavox.com.br', 'Admin Mavox', 'root', now())
ON CONFLICT (email) DO NOTHING;

-- A senha deve ser hasheada com bcrypt (custo 10)
-- Gerar hash: bcrypt.hashSync('senha_segura_aqui', 10)
-- Depois inserir na neon_auth.account
```

**Alternativa:** Criar script Node.js usando `@neondatabase/serverless` + `bcryptjs`

---

### T0.4 — Verificar/Criar `.env` com Variáveis Obrigatórias
**Arquivo:** `.env` (na raiz do projeto)

```env
# Banco de Dados (OBRIGATÓRIO)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/db?sslmode=require"

# Sessão/Cookie (OBRIGATÓRIO para middleware)
SESSION_SECRET="gere-uma-chave-aleatoria-longa-aqui-min-32-chars"

# OpenRouter (para IA do blog - configurável via painel depois)
OPENROUTER_API_KEY=""

# App URL (para links absolutos em emails/WhatsApp)
NEXT_PUBLIC_APP_URL="https://mavox-web-ten.vercel.app"

# Node Environment
NODE_ENV="development"
```

**Produção (Vercel):** Configurar estas mesmas variáveis no dashboard da Vercel → Settings → Environment Variables

---

### T0.5 — Corrigir `public_token` nas Propostas
**Arquivos:** 
- `src/app/api/propostas/[token]/route.ts`
- `src/app/proposta/[token]/page.tsx`
- `src/app/painel/quotes/[id]/QuoteDetail.tsx` (botão "Proposta Pública")

**Problema:** Atualmente usa `proposal.id` (UUID) no link, mas o plano exige `public_token` (string amigável/única).

**Solução:**
1. Gerar `public_token` único ao criar proposta (ex: `MVX-2026-ABC123`)
2. Usar esse token na URL pública: `/proposta/MVX-2026-ABC123`
3. Atualizar query na API para buscar por `public_token`

```typescript
// Na criação da proposta (quando status -> proposta_enviada):
const publicToken = `MVX-${year}-${randomString(6).toUpperCase()}`;
await sql`INSERT INTO proposals (..., public_token) VALUES (..., ${publicToken})`;
```

---

## 🟡 FASE 1 — FUNCIONALIDADES CORE (ALTA PRIORIDADE)

### T1.1 — Auto-criar Cliente ao Receber Lead do Site
**Arquivo:** `src/lib/quote-repository.ts` (função `saveQuoteRequest`)
**Regra de negócio:** "Todos os leads do site virão automaticamente registros em `clients` com `source = 'site'` e `intent = 'conhecer'`"

```typescript
// Dentro da transação, após inserir lead e quote:
const clientResult = await client.query<{ id: string }>(
  `INSERT INTO clients (id, name, email, phone, company, source, intent) 
   VALUES (gen_random_uuid(), $1, $2, $3, $4, 'site', 'conhecer') 
   ON CONFLICT (email) DO UPDATE SET 
     name = EXCLUDED.name,
     phone = EXCLUDED.phone,
     company = EXCLUDED.company
   RETURNING id`,
  [input.name, input.email, input.phone, input.company]
);
const clientId = clientResult.rows[0].id;

// Opcional: vincular quote ao client_id se adicionar coluna na tabela quotes
```

---

### T1.2 — Quantidade Editável + Desconto na Proposta Pública
**Arquivo:** `src/app/proposta/[token]/page.tsx`

**Requisitos do plano (Fase 4.1):**
- "Interatividade do cliente: pode aumentar/diminuir quantidade de serviços (recalcula total em tempo real no frontend)"
- "Controle de valores: preço unitário, quantidade, desconto (percentual ou valor fixo)"

**Implementação:**
1. Adicionar state `quantities: Record<string, number>` e `discounts: Record<string, { type: 'percent' | 'fixed', value: number }>`
2. Input `type="number"` para cada item (min=1)
3. Select para tipo de desconto + input valor
4. Recalcular `total` em `useEffect` ou `useMemo`
5. Ao clicar "Aceitar", enviar quantities + discounts para API

---

### T1.3 — Tracking `viewed_at` + Disparo Follow-up Automático
**Arquivos:**
- `src/app/api/propostas/[token]/route.ts` (GET - marcar viewed_at)
- `src/lib/notify.ts` ou novo `src/lib/followup-engine.ts`

```typescript
// Na API GET da proposta, após validar:
if (!proposal.viewed_at) {
  await sql`UPDATE proposals SET viewed_at = NOW() WHERE id = ${proposal.id}`;
  
  // Disparar follow-up do estágio "proposta_visualizada"
  await triggerFollowup(proposal.quote_id, 'proposta_visualizada');
}
```

---

### T1.4 — Disparo Automático de Pixels (gtag/fbq)
**Arquivos:**
- `src/components/PixelTracker.tsx` (novo componente)
- `src/app/layout.tsx` (incluir no layout)
- `src/lib/analytics.ts` (funções de disparo)

**Eventos mapeados no painel (`pixel_events` table):**
- `visita` → page_view
- `clique_whatsapp` → custom event
- `envio_orcamento` → form_submit / lead
- `proposta_aceita` → purchase / conversion

```typescript
// src/lib/analytics.ts
export function trackPixelEvent(eventName: string, data?: Record<string, any>) {
  // Buscar config do painel (pixel_events table)
  // Disparar gtag('event', ...) e fbq('track', ...)
  // Usar IDs configurados no painel
}
```

---

### T1.5 — Corrigir Bugs Identificados

| Bug | Arquivo | Correção |
|-----|---------|----------|
| **B1** `clientId: appointment.id` | `src/app/painel/appointments/page.tsx:69` | Buscar `client_id` real da API ou adicionar campo no tipo |
| **B2** `quote_id` pede código mas API espera UUID | `src/app/painel/followups/page.tsx:268` | Mudar input para buscar por código → resolver UUID via API |
| **B3** Tab "Lista" não funcional | `src/app/painel/quotes/page.tsx:27-32` | Implementar componente `QuotesList` + toggle state |
| **B4** Botão "+ Adicionar Item" sem onClick | `src/app/painel/quotes/[id]/QuoteDetail.tsx:340` | Adicionar modal/form para novo item |
| **B5** `proposal.id` usado como token | `src/app/proposta/[token]/page.tsx:197` | Usar `public_token` (ver T0.5) |
| **B6** `handleOpenProposal` usa `quote.id` | `src/app/painel/quotes/[id]/QuoteDetail.tsx:197` | Usar `public_token` da proposal |

---

## 🟢 FASE 2 — POLIMENTO E MELHORIAS (MÉDIA PRIORIDADE)

### T2.1 — Kanban ↔ Lista Toggle Funcional
**Arquivos:**
- `src/app/painel/quotes/page.tsx` (state `viewMode: 'kanban' | 'list'`)
- `src/app/painel/quotes/components/QuotesList.tsx` (novo componente)

---

### T2.2 — Persistir Ordenação Colunas Kanban
**Arquivo:** `src/app/painel/quotes/components/QuotesKanban.tsx`
**Backend:** Nova tabela `user_preferences` ou coluna `kanban_column_order` em `users`

```typescript
// Salvar no localStorage como MVP, depois no banco
const saveColumnOrder = (order: string[]) => {
  localStorage.setItem('kanban-column-order', JSON.stringify(order));
};
```

---

### T2.3 — Botão "Adicionar Item" no Detalhe do Orçamento
**Arquivo:** `src/app/painel/quotes/[id]/QuoteDetail.tsx`
**API:** `POST /api/painel/quotes/[id]/items` (criar)

---

### T2.4 — Cron Vercel para Posts Agendados
**Arquivo:** `vercel.json` + `src/app/api/cron/publish-posts/route.ts`

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/publish-posts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

```typescript
// src/app/api/cron/publish-posts/route.ts
export async function GET(request: Request) {
  // Verificar CRON_SECRET header
  // Buscar posts com status='scheduled' AND published_at <= NOW()
  // Atualizar status='published'
}
```

---

### T2.5 — Sitemap Dinâmico com Posts do Blog
**Arquivo:** `src/app/sitemap.ts`

```typescript
import { getPublishedPosts } from "@/lib/blog-repository";

export default async function sitemap() {
  const posts = await getPublishedPosts();
  
  const postUrls = posts.map(post => ({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`,
    lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    { url: process.env.NEXT_PUBLIC_APP_URL!, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${process.env.NEXT_PUBLIC_APP_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...postUrls,
  ];
}
```

---

### T2.6 — Corrigir `clientId` no Agendamento
**Arquivo:** `src/app/painel/appointments/page.tsx`
**API:** `GET /api/painel/clients?limit=100` para popular select de clientes no modal

---

## 📋 CHECKLIST DE EXECUÇÃO SUGERIDO

### Semana 1 — Fundação (Crítico)
- [ ] T0.1: Expandir `db/schema.sql` + executar no Neon
- [ ] T0.2: Criar `src/middleware.ts`
- [ ] T0.3: Seed usuário root no Neon Auth
- [ ] T0.4: Criar/verificar `.env` local + configurar Vercel
- [ ] T0.5: Corrigir `public_token` em propostas

### Semana 2 — Core (Alto)
- [ ] T1.1: Auto-criar client no lead
- [ ] T1.2: Quantidade editável + desconto na proposta
- [ ] T1.3: Tracking viewed_at + follow-up trigger
- [ ] T1.4: PixelTracker component + integração
- [ ] T1.5: Corrigir 6 bugs listados

### Semana 3 — Polimento (Médio)
- [ ] T2.1: Kanban ↔ Lista toggle
- [ ] T2.2: Persistir ordenação Kanban
- [ ] T2.3: Adicionar item no orçamento
- [ ] T2.4: Cron Vercel posts agendados
- [ ] T2.5: Sitemap dinâmico
- [ ] T2.6: Corrigir clientId agendamento

---

## 📁 ARQUIVOS PRINCIPAIS PARA MODIFICAR

```
├── db/schema.sql                    # T0.1 - EXPANDIR COMPLETO
├── src/middleware.ts                # T0.2 - NOVO
├── scripts/seed-admin.ts            # T0.3 - NOVO
├── .env                             # T0.4 - NOVO/VERIFICAR
├── src/app/api/propostas/[token]/route.ts  # T0.5, T1.3
├── src/app/proposta/[token]/page.tsx       # T0.5, T1.2
├── src/app/painel/quotes/[id]/QuoteDetail.tsx  # T0.5, T1.5(B4,B6)
├── src/lib/quote-repository.ts      # T1.1
├── src/app/painel/appointments/page.tsx      # T1.5(B1), T2.6
├── src/app/painel/followups/page.tsx         # T1.5(B2)
├── src/app/painel/quotes/page.tsx            # T1.5(B3), T2.1
├── src/app/painel/quotes/components/QuotesKanban.tsx  # T2.2
├── src/app/painel/quotes/components/QuotesList.tsx    # T2.1 - NOVO
├── src/components/PixelTracker.tsx             # T1.4 - NOVO
├── src/lib/analytics.ts                        # T1.4
├── src/lib/followup-engine.ts                  # T1.3 - NOVO
├── src/app/api/cron/publish-posts/route.ts     # T2.4 - NOVO
├── vercel.json                                 # T2.4
├── src/app/sitemap.ts                          # T2.5
└── src/app/layout.tsx                          # T1.4 (incluir PixelTracker)
```

---

## ⚠️ NOTAS IMPORTANTES PARA A IA EXECUTORA

1. **Ordem estrita:** Fase 0 → Fase 1 → Fase 2. Não pule itens críticos.
2. **Teste local:** Após cada tarefa, rodar `npm run build` e `npm run dev` para validar.
3. **TypeScript:** Manter tipagem rigorosa. Não usar `any` exceto onde já existente (pdfmake).
4. **Neon Auth:** As tabelas `neon_auth.user` e `neon_auth.account` são gerenciadas pelo Neon. Não criar manualmente — usar o dashboard do Neon ou API oficial.
5. **Variáveis de ambiente:** Nunca commitar `.env`. Usar `.env.example` para documentar.
6. **Deploy:** Após Fase 0 completa, fazer deploy na Vercel para validar em produção.

---

## 🔗 REFERÊNCIAS

- **PLANO_DESENVOLVIMENTO.md** — Plano original (fonte da verdade)
- **Neon Docs:** https://neon.tech/docs
- **Next.js Middleware:** https://nextjs.org/docs/app/building-your-application/routing/middleware
- **Vercel Cron Jobs:** https://vercel.com/docs/cron-jobs
- **pdfmake:** http://pdfmake.org/#/docs

---

**FIM DO DOCUMENTO — EXECUTAR TAREFAS NA ORDEM APRESENTADA**
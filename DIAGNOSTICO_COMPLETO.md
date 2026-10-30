# 📋 DIAGNÓSTICO COMPLETO MAVOX-WEB — O QUE EXISTE vs. O QUE FALTA

> Data: 30/10/2026 | Arquivo base: `usabilidade-post-deploy.md`
> **Regra: Nada será executado sem aprovação. Abaixo está a análise completa.**

---

## 🔴 FASE 0 — BUGS CRÍTICOS (Plano: 4 bugs)

| ID | Módulo | Status no Código | Onde está |
|---|--------|------------------|-----------|
| **B01** | Kanban edita quebra | ❌ NÃO CORRIGIDO — `QuoteDetail.tsx` existe mas crash não tratado | `src/app/painel/quotes/[id]/QuoteDetail.tsx` |
| **B02** | Blog IA “OpenRouter não configurado” | ⚠️ PARCIAL — `src/lib/ai.ts` + `blog/generate/route.ts` existem, mas validação real da chave via `/models` não está completa | `src/app/painel/settings/components/AISection.tsx` |
| **B03** | Blog “Criar novo texto” não abre editor | ⚠️ PARCIAL — `new/page.tsx` existe, mas `BlogEditor` pode falhar sem validação | `src/app/painel/blog/new/page.tsx` |
| **B04** | Sidebar sem seta expandir | ❌ NÃO CORRIGIDO — `PainelShell.tsx` existe, mas toggle colapsado/expandido incompleto | `src/app/painel/PainelShell.tsx` |

**Resultado Fase 0:** ❌ NÃO CONCLUÍDA (nenhum bug totalmente corrigido)

---

## 🟠 FASE 1 — MELHORIAS UX CORE

| ID | Item | Status | Arquivo / Observação |
|---|------|--------|---------------------|
| UX01 | Expandir sidebar (`ChevronRight`) | ❌ FALTANDO | `PainelShell.tsx` |
| UX02 | Logo Mavox verde no sidebar | ⚠️ PARCIAL | Logo existe em `/public/Logo MAVOX Verde Vibrante.png` |
| UX03 | Avatar usuário (`alex.jpg`) | ❌ FALTANDO | Imagem existe, não integrada |
| UX04 | `/painel/usuario` (perfil, senha) | ❌ NÃO EXISTE | Nenhum arquivo `usuario` encontrado |
| UX05 | Modal cliente no dashboard | ❌ NÃO EXISTE | `clients/new/page.tsx` é página separada, não modal |
| UX06 | Cards métricas clicáveis | ⚠️ PARCIAL | `MetricsCards.tsx` existe |
| UX07 | Importação .xlsx/JSON | ⚠️ PARCIAL | `clients/bulk/route.ts` + `template/route.ts` existem |
| UX08 | Template importação | ⚠️ PARCIAL | `template/route.ts` existe |
| UX09 | Kanban edição fluida | ❌ FALTANDO | `QuotesKanban.tsx` existe, mas crash (B01) não corrigido |
| UX10 | Preview rápido no card | ❌ FALTANDO | Não implementado |

**Resultado Fase 1:** ⚠️ ~30% feito

---

## 🟡 FASE 2 — CONFIGURAÇÕES AVANÇADAS

| ID | Item | Status | Observação |
|---|------|--------|-------------|
| CFG01 | Config SMTP | ✅ EXISTE | `SmtpSection.tsx` + `db/schema.sql` (`smtp_*`) + `email_logs` + `email_templates` |
| CFG02 | Templates e-mail | ✅ EXISTE | Tabela `email_templates` + seção no painel |
| CFG03 | Logs envio e-mail | ✅ EXISTE | Tabela `email_logs` + rota `/email-logs` |
| CFG04 | Validação real chave OpenRouter (`/models`) | ⚠️ PARCIAL | `validate-openrouter/route.ts` existe, mas pode não testar `GET /models` de fato |
| CFG05 | Seleção modelo por tarefa | ⚠️ PARCIAL | `AISection.tsx` + tabela `settings.ai_models` |
| CFG06 | Agente diário (cron 00:00) | ⚠️ PARCIAL | `db/seed_followup_rules.sql`, `scripts/seed-tags.mjs`, rota `/api/cron/daily-agent` e `/followups` existem |
| CFG07 | Contexto do agente (leads, quotes, etc) | ⚠️ PARCIAL | `daily-agent.ts` + `ai_opportunities` existem |

**Tags (tags iniciais):** `seed-tags.mjs` existe — ✅ PARCIAL

**Resultado Fase 2:** ✅ ~70% feito (marcado como “CONCLUÍDA” no documento, mas alguns detalhes ainda incompletos)

---

## 🟢 FASE 3 — BLOG & CONTEÚDO

| ID | Item | Status | Arquivo / Observação |
|---|------|--------|---------------------|
| BLG01 | Editor Rico (TipTap/Plate) | ⚠️ PARCIAL | `BlogEditor.tsx` + `BlogPostForm.tsx` existem |
| BLG02 | Upload imagens (Neon Storage / CDN) | ⚠️ PARCIAL | `media/[...key]/route.ts` + `media_assets` tabela + fallback base64 |
| BLG03 | Seleção Agente IA no editor | ⚠️ PARCIAL | `agent` campo em `posts` + dropdown no editor |
| BLG04 | CTAs automáticos no post | ⚠️ PARCIAL | `cta_enabled` na tabela, mas injeção automática pode não estar completa |
| BLG05 | Pré-visualização mobile/desktop | ❌ FALTANDO | Nenhuma aba “Preview” completa |
| BLG06 | Meta tags completas (OG, Twitter, JSON-LD) | ⚠️ PARCIAL | `opengraph-image.tsx` + `sitemap.ts` + `robots.ts` existem |
| BLG07 | Sitemap automático com posts | ⚠️ PARCIAL | `sitemap.ts` existe, mas pode não incluir todos posts publicados |
| BLG08 | Agendamento visual (calendar + timezone) | ⚠️ PARCIAL | `scheduled_timezone` + `published_at` existem, picker visual pode faltar |

**Resultado Fase 3:** ⚠️ ~50% feito (migração `004_blog_phase3.sql` aplicada)

---

## 🔵 FASE 4 — PIXELS & ANALYTICS

| ID | Item | Status | Observação |
|---|------|--------|------------|
| PIX01 | GTM (Data Layer automático) | ⚠️ PARCIAL | `GtmDataLayer.tsx` existe |
| PIX02 | GA4 via GTM | ❌ NÃO CONFIGURADO | Nenhuma referência a `GA4` no código além de comentários |
| PIX03 | Meta Pixel (CAPI) | ❌ NÃO IMPLEMENTADO | Nenhum `fbq` ou CAPI real |
| PIX04 | TikTok Pixel | ❌ NÃO EXISTE | Nenhum arquivo |
| PIX05 | Validador visual (botão “Testar” + eventos em tempo real) | ❌ NÃO EXISTE | Nenhum componente de teste visual |
| PIX06 | Debug Console (`/painel/pixels/debug`) | ⚠️ PARCIAL | `pixels/debug/page.tsx` existe |

**Resultado Fase 4:** ❌ ~10% feito (apenas groundwork)

---

## 🟣 FASE 5 — FOLLOW-UP AUTOMÁTICO

| ID | Item | Status | Arquivo / Observação |
|---|------|--------|---------------------|
| Tabelas novas (`followup_rules`, `followup_executions`, `lead_timeline`) | ✅ EXISTEM | `005_followup_phase5.sql` aplicada |
| FUP01 | Cron a cada 30min (`/api/cron/followups`) | ✅ EXISTE | `route.ts` existe |
| FUP02 | Dashboard `/painel/followups` | ✅ EXISTE | `page.tsx` existe |
| FUP03 | Timeline unificada (`/clients/[id]/timeline`) | ✅ EXISTE | `timeline/page.tsx` + `timeline/route.ts` |
| FUP04 | Motivo de perda (`lost-reason`) | ✅ EXISTE | `lost-reason/route.ts` |
| FUP05 | Re-engajamento inteligente | ⚠️ PARCIAL | `opportunities/route.ts` + `ai_opportunities` existem |

**Resultado Fase 5:** ✅ ~80% feito (migração `005_followup_phase5.sql` aplicada)

---

## 🟤 FASE 6 — ONBOARDING + KPIs

| ID | Item | Status | Observação |
|---|------|--------|------------|
| Tabelas (`client_onboardings`, `onboarding_stages`, `client_payments`, `client_reports`) | ✅ EXISTEM | `006_onboarding_phase6.sql` aplicada |
| `/painel/onboarding/[clientId]` | ⚠️ PARCIAL | `page.tsx` + rotas API existem (`onboarding/[clientId]`) |
| MRR / Churn no dashboard | ❌ NÃO IMPLEMENTADO | Nenhum cálculo de MRR real no `DashboardClient` |
| Pagamentos alertam atraso | ❌ NÃO IMPLEMENTADO | Nenhum sistema de alerta ativo |

**Resultado Fase 6:** ⚠️ ~40% feito (tabelas criadas, interface básica, KPIs faltando)

---

## 🎯 RESUMO GERAL — PORCENTAGEM POR FASE (ESTIMADA)

| Fase | Nome | % Feito | Status Real |
|---|------|---------|-------------|
| **0** | Bugs críticos | 10% | ❌ Não resolvido |
| **1** | UX Core | 30% | ⚠️ Incompleto |
| **2** | Configurações / IA / SMTP | 70% | ✅ Quase completo |
| **3** | Blog & Conteúdo | 50% | ⚠️ Editor + SEO parciais |
| **4** | Pixels & Analytics | 10% | ❌ Groundwork apenas |
| **5** | Follow-up Automático | 80% | ✅ Tabelas + rotas prontas |
| **6** | Onboarding + KPIs | 40% | ⚠️ Tabelas OK, KPIs faltam |

---

## 📁 ARQUIVOS-CHAVE QUE EXISTEM (EVIDÊNCIA FÍSICA)

- `db/schema.sql` — completo (todas as tabelas principais)
- `db/migrations/004_blog_phase3.sql` ✅
- `db/migrations/005_followup_phase5.sql` ✅
- `db/migrations/006_onboarding_phase6.sql` ✅
- `src/app/painel/` — 18 rotas/componentes de painel
- `src/app/api/` — APIs de painel, blog, cron, propostas, pixels
- `src/lib/` — `ai.ts`, `mail.ts`, `analytics.ts`, `daily-agent.ts`, `pixels-repository.ts`
- `scripts/` — `seed-tags.mjs`, `set-default-models.mjs`
- `public/` — logo verde, `alex.jpg`, `llms.txt`

---

## ⚠️ GAP CRÍTICO IDENTIFICADO

O documento `usabilidade-post-deploy.md` marca a **Fase 2 como “CONCLUÍDA”** (`✅`), mas:
- A Fase 0 (bugs críticos) está **100% aberta**
- A Fase 1 está **70% aberta**
- A Fase 4 está **90% aberta**
- A Fase 6 (KPIs MRR/Churn) está **60% aberta**

Portanto: **o sistema não está “pronto para produção” conforme os critérios do documento.**

---

## ✅ PRÓXIMO PASSO (AGUARDANDO APROVAÇÃO)

Se você aprovar, posso executar na ordem:
1. **Corrigir Fase 0** (B01–B04) — deploy hotfix
2. **Finalizar Fase 1** (sidebar, modal cliente, kanban fluido)
3. **Completar Fase 4** (GTM + pixels + validador)
4. **Fechar Fase 6** (MRR/Churn no dashboard, alertas de pagamento)

**Nenhuma alteração será feita até você confirmar a ordem e a fase de início.**

# PLANO PÓS-DEPLOY: Correções e Evoluções baseadas em Teste de Usabilidade Real

> **Origem:** Teste de usabilidade real em produção  
> **Data:** 2026-10-29  
> **Status:** Planejamento - Aguardando aprovação para execução

---

## 📊 RESUMO EXECUTIVO

| Categoria | Itens | Críticos (Bugs) | Melhorias UX | Novas Features |
|-----------|-------|-----------------|--------------|----------------|
| **Total** | 47 | 4 | 18 | 25 |

---

## 🔴 FASE 0 — BUGS CRÍTICOS (Bloqueiam uso em produção)

| ID | Módulo | Problema | Prioridade | Esforço |
|----|--------|----------|------------|---------|
| **B01** | Kanban | Clicar em card para editar quebra sistema → página de erro Vercel | 🔴 CRÍTICO | Médio |
| **B02** | Blog IA | "Gerar com IA" falha dizendo que OpenRouter não configurado (mas está) | 🔴 CRÍTICO | Baixo |
| **B03** | Blog Editor | "Criar novo texto" não abre editor manual | 🔴 CRÍTICO | Baixo |
| **B04** | Sidebar | Seta de recolher funciona, mas não tem seta para expandir | 🔴 CRÍTICO | Baixo |

---

## 🟠 FASE 1 — MELHORIAS UX CORE (Alto impacto, baixo esforço)

### 1.1 Sidebar & Navegação
| ID | Item | Detalhes |
|----|------|----------|
| UX01 | **Expandir sidebar** | Adicionar ícone `ChevronRight` quando colapsado + toggle funcional |
| UX02 | **Logo Mavox no sidebar** | Usar `/public/Logo MAVOX Verde Vibrante.png` + cor principal (#2a7a2d) |
| UX03 | **Avatar do usuário** | Foto da página "Sobre Nós" (`/public/alex.jpg`) no header do sidebar |
| UX04 | **Painel do Usuário** | Nova rota `/painel/usuario` com: perfil, foto, senha, preferências |

### 1.2 Dashboard
| ID | Item | Detalhes |
|----|------|----------|
| UX05 | **Novo Cliente em Modal** | Substituir link `/painel/clients/new` por modal no dashboard |
| UX06 | **Cards de métricas clicáveis** | Levar para listagem filtrada correspondente |

### 1.3 Clientes
| ID | Item | Detalhes |
|----|------|----------|
| UX07 | **Importação em Massa** | Modal com: (a) textarea JSON + validação, (b) upload .xlsx/.csv via `xlsx` lib |
| UX08 | **Template de importação** | Botão "Baixar template .xlsx" com colunas padrão |

### 1.3 Kanban (Funil de Vendas)
| ID | Item | Detalhes |
|----|------|----------|
| UX09 | **Corrigir edição de card** | Debug do erro ao clicar → abrir `QuoteDetail` corretamente |
| UX10 | **Preview rápido no card** | Hover/click → drawer lateral com infos essenciais (sem sair do Kanban) |

---

## 🟡 FASE 2 — CONFIGURAÇÕES AVANÇADAS (Settings)

### 2.1 SMTP & Emails
| ID | Item | Campos Necessários |
|----|------|-------------------|
| CFG01 | **Configuração SMTP** | Host, Porta, Usuário, Senha, TLS/SSL, From Name, From Email, Testar conexão |
| CFG02 | **Templates de Email** | Editor visual para: Proposta, Cold Outreach, Follow-up, Onboarding, Cobrança |
| CFG03 | **Logs de envio** | Tabela `email_logs` (destinatário, assunto, status, erro, timestamp) |

### 2.2 OpenRouter & IA
| ID | Item | Detalhes |
|----|------|----------|
| CFG04 | **Validação real da chave** | Testar `GET /models` na save → mostrar ✅/❌ + modelos disponíveis |
| CFG05 | **Seleção de modelo por tarefa** | Dropdown: Blog Writer, Lead Analyzer, Onboarding Assistant, etc. |
| CFG06 | **Agente Diário (Nemotron 3 Ultra)** | Cron 00:00 → analisa leads/quotes → gera cards de oportunidade no Dashboard |
| CFG07 | **Contexto do Agente** | Acesso a: leads, quotes, proposals, clients, followups, appointments, emails |

### 2.3 Tags - Principais Tags Iniciais
| Tag | Cor | Uso |
|-----|-----|-----|
| `🔥 Urgente` | `#ef4444` | Leads quentes |
| `💰 Pronto p/ Contratar` | `#22c55e` | Intent alto |
| `🔄 Retorno` | `#f59e0b` | Aguardando resposta |
| `📱 WhatsApp Ativo` | `#10b981` | Canal preferido |
| `🏢 Enterprise` | `#8b5cf6` | Grande porte |
| `⚠️ Risco Churn` | `#ef4444` | Cliente em risco |
| `🤝 Parceiro` | `#06b6d4` | Indicação/Parceria |
| `📋 Onboarding` | `#3b82f6` | Em implementação |

---

## 🟢 FASE 3 — BLOG & CONTEÚDO (Revisão Completa)

### 3.1 Editor & IA
| ID | Item | Detalhes |
|----|------|----------|
| BLG01 | **Editor Rico (TipTap/Plate)** | Blocos: texto, heading, imagem, lista, citação, código, CTA, divisor |
| BLG02 | **Upload de Imagens** | Drag-drop → upload para Neon Object Storage → CDN → inserir no editor |
| BLG03 | **Seleção de Agente IA** | Dropdown no editor: "Blog Writer", "SEO Specialist", "Case Study Writer" |
| BLG04 | **CTAs Automáticos** | Injetar no meio e fim do post: "Solicite Orçamento" + "Fale no WhatsApp" |
| BLG05 | **Pré-visualização** | Aba "Preview" ao lado do editor (mobile/desktop) |

### 3.2 SEO & Publicação
| ID | Item | Detalhes |
|----|------|----------|
| BLG06 | **Meta tags completas** | Title, Description, OG Image, Twitter Card, JSON-LD Article |
| BLG07 | **Sitemap automático** | Incluir posts publicados + `lastmod` |
| BLG08 | **Agendamento visual** | Calendar picker + timezone + preview de quando vai ao ar |

---

## 🔵 FASE 4 — PIXELS & ANALYTICS

| ID | Item | Detalhes |
|----|------|----------|
| PIX01 | **Google Tag Manager (GTM)** | Container ID + Data Layer automático (page_view, form_submit, whatsapp_click, proposal_view, proposal_accept) |
| PIX02 | **GA4 via GTM** | Measurement ID + Enhanced Ecommerce (proposta = purchase) |
| PIX03 | **Meta Pixel (CAPI)** | Server-side Events API + Deduplication |
| PIX04 | **TikTok Pixel** | Events API (futuro) |
| PIX05 | **Validador Visual** | Botão "Testar" → abre página teste → mostra events disparados em tempo real |
| PIX06 | **Debug Console** | `/painel/pixels/debug` → log últimos 50 eventos disparados |

---

## 🟣 FASE 5 — FOLLOW-UP AUTOMÁTICO (Motor Inteligente)

### 5.1 Estrutura de Dados Nova
```sql
-- followup_rules (configuração por estágio/gatilho)
CREATE TABLE followup_rules (
  id uuid PK,
  name text,
  trigger_type text, -- 'no_response', 'stage_stale', 'contract_pending', 'meeting_needed', 're_engage'
  trigger_config jsonb, -- { days: 3, stage: 'proposta_enviada', max_attempts: 3 }
  message_template text,
  channel text DEFAULT 'whatsapp',
  active boolean DEFAULT true,
  created_at timestamptz
);

-- followup_executions (log de execuções)
CREATE TABLE followup_executions (
  id uuid PK,
  rule_id uuid REFERENCES followup_rules(id),
  lead_id uuid REFERENCES clients(id),
  quote_id uuid REFERENCES quotes(id),
  status text, -- 'pending', 'sent', 'replied', 'failed', 'skipped'
  channel text,
  message_sent text,
  response_received boolean,
  executed_at timestamptz,
  response_at timestamptz
);

-- lead_timeline (linha do tempo unificada)
CREATE TABLE lead_timeline (
  id uuid PK,
  lead_id uuid REFERENCES clients(id),
  type text, -- 'quote_created', 'proposal_sent', 'proposal_viewed', 'whatsapp_sent', 'email_sent', 'meeting_scheduled', 'contract_signed', 'payment_received', 'note_added', 'stage_changed', 'lost_reason'
  title text,
  description text,
  metadata jsonb,
  created_by uuid, -- user_id or 'system'
  created_at timestamptz
);
```

### 5.2 Regras de Gatilho (Padrão)
| Gatilho | Condição | Ação | Janela |
|---------|----------|------|--------|
| `no_response_1` | Proposta visualizada + 2 dias sem resposta | WhatsApp template "vimos que abriu..." | 48h |
| `no_response_2` | + 5 dias (total 7) | WhatsApp template "segunda tentativa" | 7d |
| `stage_stale` | Quote em `proposta_enviada` > 10 dias | Email + WhatsApp "vencendo..." | 10d |
| `contract_pending` | Status `aprovado` + 3 dias sem contrato assinado | WhatsApp "próximos passos" | 3d |
| `meeting_needed` | Lead `avaliando` + 7 dias sem agendamento | Sugerir agendamento | 7d |
| `re_engage_lost` | Lead `recusado` + 90 dias | WhatsApp "novidades..." | 90d |
| `re_engage_competitor` | Motivo perda = "concorrente" + 180 dias | Email "como estão as coisas?" | 180d |

### 5.3 Motor de Execução
| ID | Item | Detalhes |
|----|------|----------|
| FUP01 | **Cron a cada 30min** | `/api/cron/followups` → avalia regras → cria execuções pendentes |
| FUP02 | **Dashboard de Follow-ups** | `/painel/followups` → abas: Pendentes, Enviados, Respondidos, Falharam |
| FUP03 | **Linha do Tempo Unificada** | `/painel/clients/[id]/timeline` → todos os eventos cronológicos |
| FUP04 | **Motivo de Perda** | Modal ao mover para `recusado`: dropdown (concorrente, orçamento, prazo, outro) + observação |
| FUP05 | **Re-engajamento Inteligente** | Agente IA analisa leads perdidos → sugere reativação no Dashboard |

---

## 🟤 FASE 6 — ONBOARDING DE CLIENTES (Novo Módulo Completo)

### 6.1 Estrutura de Dados
```sql
-- client_onboardings (um por cliente fechado)
CREATE TABLE client_onboardings (
  id uuid PK,
  client_id uuid REFERENCES clients(id) UNIQUE,
  quote_id uuid REFERENCES quotes(id),
  status text DEFAULT 'briefing', -- briefing, kickoff, setup, implementation, quickstart, active
  contract_signed_at timestamptz,
  contract_value numeric(12,2),
  contract_duration_months int,
  contract_file_url text,
  quickstart_target_date date,
  quickstart_completed_at timestamptz,
  squad_lead_id uuid REFERENCES users(id),
  squad_members uuid[], -- array de user_ids
  briefing_data jsonb, -- respostas do formulário
  accesses jsonb, -- { wordpress: {}, analytics: {}, ads: {}, ftp: {}, etc }
  created_at timestamptz,
  updated_at timestamptz
);

-- onboarding_stages (checklist por fase)
CREATE TABLE onboarding_stages (
  id uuid PK,
  onboarding_id uuid REFERENCES client_onboardings(id) ON DELETE CASCADE,
  stage_key text, -- briefing, kickoff, accesses, setup, implementation, quickstart
  title text,
  order_num int,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  completed_by uuid REFERENCES users(id),
  notes text
);

-- client_payments (controle financeiro)
CREATE TABLE client_payments (
  id uuid PK,
  client_id uuid REFERENCES clients(id),
  onboarding_id uuid REFERENCES client_onboardings(id),
  due_date date,
  amount numeric(12,2),
  status text, -- pending, paid, late, partial
  paid_at timestamptz,
  payment_method text,
  invoice_url text,
  interest_applied numeric(12,2) DEFAULT 0,
  notes text
);

-- client_reports (relatórios mensais)
CREATE TABLE client_reports (
  id uuid PK,
  client_id uuid REFERENCES clients(id),
  period_start date,
  period_end date,
  metrics jsonb, -- { leads: 10, conversions: 3, spend: 5000, roas: 3.2 }
  file_url text,
  generated_at timestamptz,
  sent_to_client_at timestamptz
);
```

### 6.2 Interface - `/painel/onboarding/[clientId]`
| Seção | Componentes |
|-------|-------------|
| **Header** | Status badge, progress bar (0-100%), quickstart countdown |
| **Aba 1: Briefing** | Formulário dinâmico (tipo serviço → campos específicos), save draft, PDF export |
| **Aba 2: Contrato** | Upload PDF assinado, valor, vigência, vencimento, alertas de renovação |
| **Aba 3: Acessos** | Grid: Plataforma | URL | Login | Senha (oculta) | Status | Responsável |
| **Aba 4: Squad** | Seleção de usuários do sistema + roles (Lead, Designer, Dev, Ads, Conteúdo) |
| **Aba 5: Checklist** | Fases expansíveis com tasks, responsible, deadline, done/pending |
| **Aba 6: Financeiro** | Tabela pagamentos (vencidos, próximos, histórico), MRR do cliente |
| **Aba 7: Relatórios** | Upload PDF mensal, métricas-chave, envio automático por email |
| **Aba 8: Histórico** | Timeline unificada (lead_timeline filtrada por client_id) |

### 6.3 KPIs & Dashboard Executivo
| Métrica | Fonte | Frequência |
|---------|-------|------------|
| **MRR Atual** | `client_payments` (status=paid, mês atual) | Tempo real |
| **Churn Rate** | Cancelamentos / Base ativa | Mensal |
| **LTV Médio** | Soma pagamentos / clientes ativos | Mensal |
| **CAC** | Gasto marketing / Novos clientes | Mensal |
| **Lead → Cliente %** | Quotes `aprovado` / Total quotes | Semanal |
| **Tempo Médio Fechamento** | `created_at` → `aprovado` | Semanal |
| **Onboarding Time** | `contract_signed` → `quickstart_completed` | Por cliente |
| **Receita Atrasada** | `client_payments` status=late | Diário |

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1-2: Estabilização (Fase 0 + 1.1-1.3)
- [ ] B01-B04 (bugs críticos)
- [ ] UX01-UX10 (sidebar, dashboard modal, importação, kanban fix)
- [ ] Deploy hotfix

### Semana 3-4: Configurações & IA (Fase 2)
- [ ] CFG01-CFG03 (SMTP + templates)
- [ ] CFG04-CFG07 (OpenRouter validação + Agente Diário)
- [ ] Tags iniciais + seed no banco

### Semana 5-6: Blog & Pixels (Fase 3 + 4)
- [ ] BLG01-BLG08 (Editor rico + IA + CTAs + SEO)
- [ ] PIX01-PIX06 (GTM + GA4 + Meta CAPI + Validador)

### Semana 7-9: Follow-up Automático (Fase 5)
- [ ] Novas tabelas + migrations
- [ ] FUP01-FUP05 (Motor + Dashboard + Timeline + Lost Reason + Re-engage)

### Semana 10-13: Onboarding + KPIs (Fase 6)
- [ ] Novas tabelas + migrations
- [ ] Módulo completo `/painel/onboarding/[id]`
- [ ] Dashboard executivo com MRR, Churn, LTV, CAC
- [ ] Relatórios automáticos mensais

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO POR FASE

| Fase | Critério "Done" |
|------|-----------------|
| **Fase 0** | 0 erros no console, Kanban edita sem crash, Blog IA gera, Sidebar expande |
| **Fase 1** | Modal cliente no dashboard, Import .xlsx/JSON funciona, Kanban fluido |
| **Fase 2** | Email de teste chega, OpenRouter valida ✅, Agente diário roda 00:00 |
| **Fase 3** | Post com imagens + CTAs publica, Sitemap atualiza, Preview mobile OK |
| **Fase 4** | GTM/GA4/Meta disparam no site, Validador mostra events em tempo real |
| **Fase 5** | Follow-ups disparam sozinhos, Timeline completa, Lost reason salva |
| **Fase 6** | Onboarding 2-3 dias, MRR/Churn no dashboard, Pagamentos alertam atraso |

---

## ⚠️ RISCOS & MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Neon Object Storage para imagens** | Média | Alto | Testar upload/CDN antes do BLG02; fallback: base64 ou Cloudinary |
| **Agente IA (Nemotron) rate limit** | Alta | Médio | Cache de 24h no Dashboard; fallback para gpt-3.5-turbo |
| **Migrações SQL complexas** | Média | Alto | Scripts versionados + rollback testados em branch Neon |
| **Cron Vercel 5min + 30min** | Baixa | Médio | Monitorar execução + logs; alertar se falhar 3x seguidas |
| **Onboarding escopo creep** | Alta | Alto | MVP = Briefing + Contrato + Checklist; resto em v2 |

---

## 📋 PRÓXIMOS PASSOS IMEDIATOS

1. **Aprovar este plano** → mover para execução
2. **Criar branch `feat/usabilidade-fixes`** 
3. **Começar Fase 0** (bugs críticos) - deploy hotfix em 1 dia
4. **Daily standup** para acompanhar progresso por fase

---

**Pronto para executar?** Se aprovado, saio do Plan mode e começo pela Fase 0 (bugs críticos).
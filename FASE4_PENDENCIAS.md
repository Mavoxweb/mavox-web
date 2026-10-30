# Fase 4 — Pendências para Conclusão 100%

> Salvo em: 30/10/2026 | Build atual: ✅ passando

---

## ✅ Concluído (Steps 1-5)

| Item | Descrição |
|------|-----------|
| **Step 1** | DB: `settings` (GTM, GA4, TikTok, Meta CAPI), `pixel_events` (tiktok), `pixel_event_logs` + índices |
| **Step 2** | `PixelTracker.tsx`: GTM único, Meta Pixel cliente, TikTok cliente, Meta CAPI com **deduplicação event_id compartilhado** + renovação SPA |
| **Step 3** | `GtmDataLayer.tsx`: eventos `proposal_view`, `proposal_accept`, `lead` + hook `usePixelEvents()` |
| **Step 4** | `pixel_event_logs` API (GET/POST) + `/painel/pixels/debug` polling 5s, badges, details, botões de teste |
| **Step 5** | `pixels-repository.ts` + `layout.tsx` integrados |

---

## ❌ Pendentes para 100% da Fase 4

### **PIX05 — Validador Visual** (Alto impacto UX)
**Objetivo:** Botão "Testar" → abre página teste → mostra events disparados em tempo real

**Implementação sugerida:**
1. Nova rota: `/painel/pixels/validator` (Client Component)
2. Página standalone que:
   - Carrega `PixelTracker` completo (mesmos IDs do painel)
   - Injeta script de teste automático (simula navegação, cliques WhatsApp, form submit, proposal_view/accept)
   - Mostra eventos em tempo real via SSE ou polling do `/api/painel/pixels/log`
   - UI: lista lateral com eventos chegando, badge "AO VIVO", botão "Limpar", "Exportar JSON"
3. Link no `/painel/pixels/debug` e no `/painel/pixels` principal

**Arquivos a criar:**
- `src/app/painel/pixels/validator/page.tsx`
- Atualizar `src/app/painel/pixels/page.tsx` com link

---

### **PIX04 — TikTok Events API (Server-side / CAPI equivalent)** (Médio)
**Objetivo:** TikTok Pixel server-side com deduplicação (equivalente ao Meta CAPI)

**Status atual:** Script cliente (`ttq`) já implementado no `PixelTracker.tsx`

**Faltando:**
1. Endpoint TikTok: `https://business-api.tiktok.com/open_api/v1.3/event/track/`
2. Auth: Access Token + App ID / Pixel Code
3. Deduplicação: `event_id` compartilhado entre cliente (`ttq.track`) e servidor
3. Campos no painel: **já existem** (`tiktok_pixel_id` em `settings` + `pixel_id_tiktok` em `pixel_events`)

**Implementação sugerida:**
1. Adicionar em `settings`: `tiktok_access_token`, `tiktok_app_id`
2. No `PixelTracker.tsx`: gerar `window._mavoxTikTokEventId`, interceptar `ttq.track` para injetar `event_id`, disparar `fetch` server-side com mesmo `event_id`
3. Renovar `event_id` a cada navegação SPA (igual Meta CAPI)
4. Log no `pixel_event_logs` com `pixel_type: 'tiktok'`

---

## 📝 Como retomar

```bash
# 1. Aplicar migration se banco mudou
# psql $DATABASE_URL -f db/migrations/007_pixels_phase4.sql

# 2. Criar validador visual
# code src/app/painel/pixels/validator/page.tsx

# 3. Implementar TikTok CAPI
# code src/components/PixelTracker.tsx  (adicionar bloco TikTok CAPI)
# code src/app/api/painel/settings/route.ts  (adicionar tiktok_access_token, tiktok_app_id)
# code src/app/painel/settings/page.tsx  (adicionar campos no formulário)
```

---

## 🔗 Referências

- Meta CAPI dedup: `PixelTracker.tsx` linhas 59-140 (padrão a seguir)
- Debug console: `/painel/pixels/debug` (polling 5s funcionando)
- Data Layer events: `GtmDataLayer.tsx` hook `usePixelEvents()`
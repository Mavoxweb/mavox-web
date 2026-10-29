# Mavox — Desenvolvimento Web para Pequenas e Médias Empresas

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Site institucional da **Mavox**, agência de desenvolvimento web e marketing digital focada em pequenas e médias empresas. O objetivo é simples: dar presença digital profissional, rápida e orientada a resultados para quem ainda não tem ou tem um site amador que não vende.

---

## O que o projeto resolve

Dono de negócio não precisa de um "cartão de visitas bonito". Precisa de um site que:

- **Apareça no Google** quando o cliente busca sua solução
- **Ganhe confiança** antes da primeira conversa pelo WhatsApp
- **Gere contatos previsíveis**, não dependa só de indicação
- **Esteja no ar o tempo todo**, com suporte humano quando algo der errado

Este repositório é o front-end completo da Mavox, construído com foco em performance, SEO, acessibilidade e percepção de valor.

---

## Demonstração

A página inicial é uma única página (one page) com as seguintes seções:

| Seção | O que entrega |
|-------|---------------|
| **Hero** | Apresentação imediata com painel visual de fluxo de contatos |
| **Empresas que cresceram** | Faixa de logos de clientes (oculta até ter dados reais) |
| **Dores do cliente** | Problemas que o site da Mavox resolve (venda, caixa, suporte) |
| **Serviços** | 8 cards: Landing Page, Conteúdo Digital, Site Institucional, E-commerce, Sistemas sob medida, Tráfego Pago, Marca de Alto Valor, Manutenção |
| **Cases / Sites entregos** | Estrutura pronta para prints de projetos reais |
| **Como funciona** | Linha do tempo de 4 etapas (diagnóstico, proposta, desenvolvimento, lançamento) |
| **Sobre** | Quem é a Mavox e por que existe |
| **Depoimentos** | Estrutura pronta para depoimentos reais |
| **Perguntas frequentes** | Acordeão com respostas sobre preço, prazo, propriedade e pagamento |
| **CTA final** | Formulário de orçamento com validação e anti-spam |
| **Rodapé** | Navegação, contato, política e termos |

---

## Stack de tecnologia

| Camada | Tecnologia | Por que escolhemos |
|--------|-----------|-------------------|
| Framework | **Next.js 15** (App Router) | SSR/SSG, rotas dinâmicas, otimização automática de imagens e fontes |
| Estilização | **Tailwind CSS v4** | Design system consistente com utilitários direto no HTML |
| Linguagem | **TypeScript** | Tipagem estática, menos bugs em produção, melhor manutenção |
| Ícones | **Lucide React** | Ícones leves, consistentes e fáceis de customizar |
| Animações | **Motion** (Framer Motion) | Transições suaves e entrada de elementos em scroll |
| Formulários | **React Hook Form** + **Zod** | Validação de dados no cliente e servidor |
| Notificações | **Sonner** | Toasts elegantes para feedback do usuário após ações |
| Estatísticas / Pixel | **Meta Pixel (Facebook)** | Rastreamento de visitas e eventos de Lead |
| Deploy | **Vercel** | Edge network, CI/CD automático via GitHub, domínios customizados |

---

## Estrutura do projeto

```
mavox-web/
├── public/                 # Imagens, favicon, logos e cases
├── src/
│   ├── app/                # Rotas da aplicação (App Router)
│   │   ├── layout.tsx      # Metadata SEO, JSON-LD, Pixel, viewport
│   │   ├── page.tsx        # Página inicial com todas as seções
│   │   ├── not-found.tsx   # Página 404 personalizada
│   │   ├── opengraph-image.tsx
│   │   ├── robots.ts       # robots.txt gerado estaticamente
│   │   └── sitemap.ts      # sitemap.xml gerado estaticamente
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Hero.tsx
│   │   ├── Services.tsx    # Grade de 8 serviços
│   │   ├── FAQ.tsx         # Acordeão animado
│   │   ├── Footer.tsx      # Navegação, contato e legal
│   │   ├── Floating.tsx    # Botão flutuante do WhatsApp
│   │   ├── LeadForm.tsx    # Formulário com validação
│   │   └── ...
│   ├── data/               # Conteúdo centralizado
│   │   ├── services.ts     # Definição dos 8 serviços
│   │   ├── cases.ts        # Estrutura de cases (prints)
│   │   ├── clients.ts      # Logos e métricas
│   │   ├── content.ts      # Textos (Pains, Processo, FAQ, Depoimentos)
│   │   └── site.ts         # Dados institucionais (endereço, telefones, redes sociais)
│   ├── lib/                # Utilitários
│   │   ├── analytics.ts    # Rastreamento de eventos Lead
│   │   ├── notify.ts       # Notificações via Sonner
│   │   ├── quote.ts        # Validação do formulário de orçamento
│   │   └── site.ts         # Dados institucionais
│   └── globals.css         # Tokens de design e superfícies (dark/light/paper)
├── vercel.json             # Configuração de deploy e headers de segurança
├── next.config.mjs         # Config Next.js (imagens, desabilitar powered-by)
├── .env.example            # Exemplo de variáveis de ambiente
├── README.md
├── package.json
└── tsconfig.json
```

---

## Funcionalidades principais

- **Design responsivo** — mobile-first com breakpoints `sm`, `md`, `lg`
- **Alternância de superfícies** — seções escuras, claras e em papel para ritmo visual e contraste
- **Acordeão de FAQ** — animação suave de `max-height` ao abrir e fechar
- **Formulário de orçamento** — validação com Zod, máscara de WhatsApp, limite de 5 envios por IP a cada 10 minutos (anti-spam)
- **Botão flutuante do WhatsApp** — disparo de evento Lead no Meta Pixel ao clicar
- **Seção de cases** — pronta para receber prints reais de projetos entregues
- **Dados estruturados** — JSON-LD `Organization` e `FAQPage` para motores de busca e I.A.
- **Open Graph + Twitter Card** — pré-visualização ao compartilhar em redes sociais
- **Sitemap.xml e robots.txt** — gerados estaticamente no build
- **Headers de segurança** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- **Acessibilidade** — Lighthouse 100 em Acessibilidade e SEO (mobile e desktop)

---

## Como rodar localmente

```bash
# 1. Clone o repositório
git clone https://github.com/Mavoxweb/mavox-web.git
cd mavox-web

# 2. Instale as dependências
npm install

# 3. Crie o arquivo de variáveis de ambiente
cp .env.example .env.local

# 4. Rode em modo de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

### Scripts disponíveis

| Script | Função |
|--------|--------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Build de produção otimizado |
| `npm run start` | Servidor de produção (após o build) |
| `npm run lint` | ESLint para qualidade de código |
| `npm run typecheck` | Verificação de tipos TypeScript (`tsc --noEmit`) |

---

## Variáveis de ambiente (`.env.example`)

Copie `.env.example` para `.env.local` e preencha:

```env
# Neon (fase 2)
DATABASE_URL=postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# URL canônica do site (usada em sitemap, canonical e Open Graph)
NEXT_PUBLIC_SITE_URL=https://mavox.com.br

# Número do WhatsApp da Mavox (com DDI, sem espaços)
NEXT_PUBLIC_WHATSAPP=5521992855872

# ID do Meta Pixel para rastreamento (deixe vazio para desativar)
NEXT_PUBLIC_META_PIXEL_ID=
```

As URLs do Instagram e Facebook já estão definidas em `src/lib/site.ts`.

---

## Deploy na Vercel

O projeto está configurado para deploy automático na Vercel via GitHub.

### Passo a passo

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em **Add New → Project**
3. Importe o repositório `Mavoxweb/mavox-web`
4. O framework é detectado automaticamente como **Next.js**
5. Nas **Environment Variables**, adicione as variáveis do `.env.example`
6. Clique em **Deploy**
7. A cada push na branch `main`, a Vercel faz o deploy automático

### Domínio personalizado

No painel da Vercel, vá em **Settings → Domains** e adicione `mavox.com.br`. A Vercel cuida do DNS e do SSL automaticamente.

---

## SEO e GEO (otimização para I.A.)

O site está preparado para ranquear no Google e ser compreendido por modelos de I.A.:

- Meta tags Open Graph e Twitter Card
- JSON-LD `Organization` e `FAQPage` (dados estruturados)
- Canonical URL definida
- Facebook domain verification
- Headings semânticos (`h1` → `h2` → `h3`) e landmarks ARIA
- Sitemap e robots.txt estáticos
- Conteúdo focado em palavras-chave do nicho (site institucional, loja virtual, tráfego pago, branding)

---

## Próximos passos (Roadmap)

- [ ] Preencher `src/data/cases.ts` com prints reais de projetos entregues
- [ ] Preencher `src/data/clients.ts` com logos reais de clientes
- [ ] Preencher `src/data/content.ts` com depoimentos reais com foto
- [ ] Conectar o formulário de orçamento ao banco Neon (fase 2)
- [ ] Adicionar seção de blog / notícias
- [ ] Testes automatizados (Jest / Playwright)

---

## Licença

MIT — livre para uso, modificação e distribuição. Veja o arquivo `LICENSE` para mais detalhes.

---

Feito com foco em resultado para pequenos negócios que querem crescer com autoridade digital.
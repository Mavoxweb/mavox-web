export interface EmailTemplate {
  key: string;
  name: string;
  subject: string;
  body_html: string;
}

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    key: "proposta",
    name: "Proposta comercial",
    subject: "Proposta {{empresa}} — {{servico}}",
    body_html: `<h2>Olá, {{nome}}!</h2>
<p>Conforme conversamos, segue a proposta da <strong>Mavox</strong> para {{servico}}.</p>
<p><strong>Investimento:</strong> {{valor}}<br/>
<strong>Prazo estimado:</strong> {{prazo}}</p>
<p><a href="{{link}}" style="display:inline-block;padding:12px 20px;background:#22c55e;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Ver proposta completa</a></p>
<p>Qualquer dúvida, estou à disposição.</p>
<p>Abraços,<br/>Equipe Mavox</p>`,
  },
  {
    key: "cold_outreach",
    name: "Cold outreach",
    subject: "{{empresa}}: uma ideia rápida para {{servico}}",
    body_html: `<p>Olá, {{nome}}!</p>
<p>Vi o trabalho da <strong>{{empresa}}</strong> e acredito que podemos ajudar com {{servico}}.</p>
<p>Preparamos uma ideia inicial sem compromisso. Podemos conversar 15 minutos esta semana?</p>
<p><a href="{{link}}">Agendar conversa</a></p>
<p>Abraços,<br/>Equipe Mavox</p>`,
  },
  {
    key: "followup",
    name: "Follow-up",
    subject: "{{nome}}, posso te ajudar com a proposta?",
    body_html: `<p>Olá, {{nome}}!</p>
<p>Passando para saber se você conseguiu avaliar a proposta de {{servico}} que enviamos.</p>
<p>Ficou alguma dúvida sobre escopo, prazo ou investimento? Respondo por aqui mesmo.</p>
<p><a href="{{link}}">Revisar proposta</a></p>
<p>Abraços,<br/>Equipe Mavox</p>`,
  },
  {
    key: "onboarding",
    name: "Boas-vindas / Onboarding",
    subject: "Bem-vindo à Mavox, {{nome}}!",
    body_html: `<h2>Seja bem-vindo(a), {{nome}}!</h2>
<p>É um prazer ter a <strong>{{empresa}}</strong> com a gente. Nos próximos 2 a 3 dias vamos concluir o quickstart do seu projeto.</p>
<ol>
  <li>Reunião de briefing</li>
  <li>Acessos e permissões</li>
  <li>Definição da squad e cronograma</li>
</ol>
<p>Qualquer dúvida, fale com a gente por WhatsApp.</p>
<p>Equipe Mavox</p>`,
  },
  {
    key: "cobranca",
    name: "Cobrança",
    subject: "Lembrete de pagamento — {{empresa}}",
    body_html: `<p>Olá, {{nome}}!</p>
<p>Identificamos que a fatura de {{valor}} referente a {{servico}} está em aberto.</p>
<p>Se o pagamento já foi realizado, desconsidere este e-mail. Caso precise de um novo link ou tenha dúvidas, é só responder.</p>
<p>Obrigado,<br/>Equipe Mavox</p>`,
  },
];

export function renderTemplate(
  template: string,
  vars: Record<string, string | number | null | undefined>
): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) => {
    const value = vars[key];
    return value === null || value === undefined ? match : String(value);
  });
}

export function findDefaultTemplate(key: string): EmailTemplate | undefined {
  return DEFAULT_TEMPLATES.find((t) => t.key === key);
}

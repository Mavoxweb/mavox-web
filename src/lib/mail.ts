import nodemailer, { type Transporter } from "nodemailer";
import { queryOne, run } from "@/lib/db";
import { findDefaultTemplate, renderTemplate, type EmailTemplate } from "@/lib/email-templates";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string | null;
  pass: string | null;
  fromName: string;
  fromEmail: string;
}

interface SettingsRow {
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_password: string | null;
  smtp_secure: boolean | null;
  smtp_from_name: string | null;
  smtp_from_email: string | null;
  company_name: string | null;
  company_email: string | null;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const row = await queryOne<SettingsRow>(
    `SELECT smtp_host, smtp_port, smtp_user, smtp_password, smtp_secure,
            smtp_from_name, smtp_from_email, company_name, company_email
     FROM settings WHERE id = 1`
  );

  if (!row?.smtp_host) return null;

  return {
    host: row.smtp_host,
    port: row.smtp_port ?? 587,
    secure: row.smtp_secure ?? (row.smtp_port === 465),
    user: row.smtp_user,
    pass: row.smtp_password,
    fromName: row.smtp_from_name || row.company_name || "Mavox",
    fromEmail: row.smtp_from_email || row.company_email || row.smtp_user || "",
  };
}

export function createTransport(config: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user
      ? {
          user: config.user,
          pass: config.pass ?? "",
        }
      : undefined,
  });
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  templateKey?: string;
}

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  let config: SmtpConfig | null = null;

  try {
    config = await getSmtpConfig();
  } catch (error) {
    const message =
      "Não foi possível ler as configurações de SMTP. Rode a migração db/migrations/002_phase2_ai_smtp.sql.";
    await logEmail(input, "error", message);
    return { ok: false, error: message };
  }

  if (!config || !config.fromEmail) {
    const message = "SMTP não configurado. Preencha host e e-mail remetente em Configurações › SMTP.";
    await logEmail(input, "error", message);
    return { ok: false, error: message };
  }

  try {
    const transport = createTransport(config);
    await transport.sendMail({
      from: `"${config.fromName.replace(/"/g, "")}" <${config.fromEmail}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    await logEmail(input, "sent");
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao enviar e-mail";
    await logEmail(input, "error", message);
    return { ok: false, error: message };
  }
}

export async function testSmtpConnection(): Promise<SendEmailResult> {
  try {
    const config = await getSmtpConfig();
    if (!config) {
      return {
        ok: false,
        error: "SMTP não configurado. Preencha host e e-mail remetente antes de testar.",
      };
    }
    const transport = createTransport(config);
    await transport.verify();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao conectar no SMTP";
    return { ok: false, error: message };
  }
}

export async function getEmailTemplate(key: string): Promise<EmailTemplate | null> {
  try {
    const row = await queryOne<EmailTemplate>(
      `SELECT key, name, subject, body_html FROM email_templates WHERE key = $1`,
      [key]
    );
    if (row) return row;
  } catch {
    // tabela pode não existir antes da migração — usa default
  }
  return findDefaultTemplate(key) ?? null;
}

export interface SendTemplatedEmailInput {
  to: string;
  templateKey: string;
  vars: Record<string, string | number | null | undefined>;
  subjectOverride?: string;
}

export async function sendTemplatedEmail(
  input: SendTemplatedEmailInput
): Promise<SendEmailResult> {
  const template = await getEmailTemplate(input.templateKey);
  if (!template) {
    return { ok: false, error: `Template "${input.templateKey}" não encontrado.` };
  }

  return sendEmail({
    to: input.to,
    subject: renderTemplate(input.subjectOverride || template.subject, input.vars),
    html: renderTemplate(template.body_html, input.vars),
    templateKey: input.templateKey,
  });
}

async function logEmail(
  input: SendEmailInput,
  status: "sent" | "error",
  error?: string
): Promise<void> {
  try {
    await run(
      `INSERT INTO email_logs (to_email, subject, template_key, status, error)
       VALUES ($1, $2, $3, $4, $5)`,
      [input.to, input.subject, input.templateKey ?? null, status, error ?? null]
    );
  } catch {
    // Log não deve derrubar o envio. A tabela pode não existir antes da migração.
  }
}

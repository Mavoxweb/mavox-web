"use server";
import { headers } from "next/headers";
import { leadSchema, type LeadInput } from "@/lib/lead";
import { saveLead } from "@/lib/quote-repository";

// Rate limit em memória por IP (suficiente para a fase 1; migrar para o Neon na fase 2).
const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function limited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) { hits.set(ip, { count: 1, reset: now + WINDOW_MS }); return false; }
  entry.count += 1;
  return entry.count > MAX_HITS;
}

export async function submitLead(input: LeadInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };
  if (parsed.data.website) return { ok: true }; // honeypot: finge sucesso para bots

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "local";
  if (limited(ip)) return { ok: false, error: "Muitas tentativas. Tente novamente em alguns minutos." };

  const { name, phone, business } = parsed.data;
  await saveLead({ name, phone, business });
  return { ok: true };
}

import { NextResponse } from "next/server";
import { googleAdsLeadSchema } from "@/lib/google-ads-lead";
import { saveGoogleAdsLead } from "@/lib/quote-repository";

const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function limited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_HITS;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível ler o envio." }, { status: 400 });
  }

  const parsed = googleAdsLeadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "local";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
  }

  try {
    const { name, phone, company, city, offer } = parsed.data;
    const saved = await saveGoogleAdsLead({ name, phone, company, city, offer });
    return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
  } catch (error) {
    console.error("Falha ao gravar lead da LP /google-ads", error);
    return NextResponse.json(
      { ok: false, error: "Não foi possível enviar agora. Chame no WhatsApp que a gente recebe seus dados por lá." },
      { status: 503 },
    );
  }
}

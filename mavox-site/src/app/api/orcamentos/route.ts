import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/quote";
import { saveQuoteRequest } from "@/lib/quote-repository";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = quoteRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const result = await saveQuoteRequest(parsed.data);
  return NextResponse.json({ ok: true, id: result.id }, { status: 201 });
}

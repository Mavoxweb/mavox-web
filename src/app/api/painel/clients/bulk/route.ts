import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { importLeadBatch } from "@/lib/lead-import-repository";
import { normalizeImportMeta } from "@/lib/lead-import";

interface BulkPayload {
  leads: unknown[];
  meta: ReturnType<typeof normalizeImportMeta>;
  origin: string;
}

function looksLikeApifyLeads(leads: unknown[]): boolean {
  return leads.some((lead) => {
    if (!lead || typeof lead !== "object") return false;
    const record = lead as Record<string, unknown>;
    return (
      "telefone_e164" in record ||
      "faixa" in record ||
      "mensagem_abordagem_sugerida" in record ||
      "nicho_detalhe" in record
    );
  });
}

/** Aceita { meta, leads }, { data: { meta, leads } }, { data: [...] }, [...]. */
function extractPayload(body: unknown): BulkPayload {
  const root =
    body && typeof body === "object" && !Array.isArray(body) && "data" in body
      ? (body as Record<string, unknown>).data
      : body;

  if (Array.isArray(root)) {
    return {
      leads: root,
      meta: null,
      origin: looksLikeApifyLeads(root) ? "apify" : "manual",
    };
  }

  if (root && typeof root === "object") {
    const record = root as Record<string, unknown>;
    const list = Array.isArray(record.leads)
      ? record.leads
      : Array.isArray(record.clients)
        ? record.clients
        : [];
    const meta = normalizeImportMeta(record.meta);
    return {
      leads: list,
      meta,
      origin: meta ? "apify" : looksLikeApifyLeads(list) ? "apify" : "manual",
    };
  }

  return { leads: [], meta: null, origin: "manual" };
}

export async function POST(request: Request) {
  try {
    const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
    const contentType = request.headers.get("content-type") || "";
    let payload: BulkPayload;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: 0, errors: ["Nenhum arquivo enviado"] },
          { status: 400 }
        );
      }
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      payload = {
        leads: rows.map((row) => ({
          name: row.name || row.Nome || "",
          email: row.email || row.Email || "",
          phone: row.phone || row.Telefone || row.WhatsApp || "",
          company: row.company || row.Empresa || "",
          source: String(row.source || row.Origem || "manual").toLowerCase() === "site" ? "site" : "manual",
          intent:
            String(row.intent || row.Intencao || "conhecer").toLowerCase() === "pronto_para_contratar"
              ? "pronto_para_contratar"
              : String(row.intent || row.Intencao || "conhecer").toLowerCase() === "avaliando"
                ? "avaliando"
                : "conhecer",
          tagIds:
            row.tagIds || row.Tags
              ? String(row.tagIds || row.Tags)
                  .split(";")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              : [],
        })),
        meta: null,
        origin: "xlsx",
      };
    } else {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          { success: 0, errors: ["JSON inválido"] },
          { status: 400 }
        );
      }
      payload = extractPayload(body);
    }

    if (payload.leads.length === 0) {
      return NextResponse.json(
        { success: 0, errors: ["Nenhum cliente válido encontrado"] },
        { status: 400 }
      );
    }

    const result = await importLeadBatch(payload.leads, payload.meta, {
      origin: payload.origin,
      dryRun,
    });

    return NextResponse.json(result, { status: result.success > 0 || dryRun ? 200 : 422 });
  } catch (error) {
    console.error("Erro na importação em massa:", error);
    return NextResponse.json(
      { success: 0, errors: ["Erro interno do servidor"] },
      { status: 500 }
    );
  }
}

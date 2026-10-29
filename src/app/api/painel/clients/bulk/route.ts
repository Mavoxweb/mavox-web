import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";
import * as XLSX from "xlsx";

interface ClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: "manual" | "site";
  intent?: "conhecer" | "avaliando" | "pronto_para_contratar";
  tagIds?: string[];
}

async function processClientInTransaction(client: ClientInput): Promise<void> {
  await query("BEGIN");
  try {
    if (client.email) {
      const existing = await query<{ id: string }>(
        `SELECT id FROM clients WHERE email = $1 LIMIT 1`,
        [client.email]
      );
      if (existing.length > 0) {
        const clientId = existing[0].id;
        await query(
          `UPDATE clients SET name = $1, phone = $2, company = $3, source = $4, intent = $5 WHERE id = $6`,
          [client.name, client.phone || null, client.company || null, client.source || "manual", client.intent || "conhecer", clientId]
        );
        if (client.tagIds && client.tagIds.length > 0) {
          await query(`DELETE FROM client_tags WHERE client_id = $1`, [clientId]);
          for (const tagId of client.tagIds) {
            await query(
              `INSERT INTO client_tags (client_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [clientId, tagId]
            );
          }
        }
      } else {
        const result = await query<{ id: string }>(
          `INSERT INTO clients (id, name, email, phone, company, source, intent) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING id`,
          [client.name, client.email || null, client.phone || null, client.company || null, client.source || "manual", client.intent || "conhecer"]
        );
        const clientId = result[0].id;
        if (client.tagIds && client.tagIds.length > 0) {
          for (const tagId of client.tagIds) {
            await query(
              `INSERT INTO client_tags (client_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [clientId, tagId]
            );
          }
        }
      }
    }
    await query("COMMIT");
  } catch (error) {
    await query("ROLLBACK");
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let clients: ClientInput[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ success: 0, errors: ["Nenhum arquivo enviado"] }, { status: 400 });
      }
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      clients = jsonData.map((row: any) => ({
        name: row.name || row.Nome || "",
        email: row.email || row.Email || "",
        phone: row.phone || row.Telefone || row.WhatsApp || "",
        company: row.company || row.Empresa || "",
        source: (row.source || row.Origem || "manual").toLowerCase() === "site" ? "site" : "manual",
        intent: (row.intent || row.Intencao || "conhecer").toLowerCase() === "pronto_para_contratar" ? "pronto_para_contratar" :
                (row.intent || row.Intencao || "conhecer").toLowerCase() === "avaliando" ? "avaliando" : "conhecer",
        tagIds: row.tagIds || row.Tags ? String(row.tagIds || row.Tags).split(";").map((t: string) => t.trim()).filter(Boolean) : [],
      }));
    } else {
      const body = await request.json();
      clients = body.data || [];
    }

    if (!clients.length) {
      return NextResponse.json({ success: 0, errors: ["Nenhum cliente válido encontrado"] }, { status: 400 });
    }

    const errors: string[] = [];
    let success = 0;

    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      if (!client.name || !client.name.trim()) {
        errors.push(`Linha ${i + 1}: Nome é obrigatório`);
        continue;
      }
      try {
        await processClientInTransaction(client);
        success++;
      } catch (err) {
        errors.push(`Linha ${i + 1} (${client.name}): ${err instanceof Error ? err.message : "Erro desconhecido"}`);
      }
    }

    return NextResponse.json({ success, errors });
  } catch (error) {
    console.error("Erro na importação em massa:", error);
    return NextResponse.json({ success: 0, errors: ["Erro interno do servidor"] }, { status: 500 });
  }
}
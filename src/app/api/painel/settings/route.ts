import { NextResponse } from "next/server";
import { query, queryOne, run } from "@/lib/db";

export async function GET() {
  const settings = await queryOne(`SELECT * FROM settings WHERE id = 1`);
  
  if (!settings) {
    // Retornar configurações padrão
    return NextResponse.json({
      openrouter_api_key: "",
      company_name: "Mavox",
      company_email: "contato@mavox.com.br",
      company_phone: "(21) 99999-9999",
      company_address: "",
      whatsapp_number: "5521992855872",
      meta_pixel_id: "",
      google_ads_id: "",
    });
  }
  
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      openrouter_api_key,
      company_name,
      company_email,
      company_phone,
      company_address,
      whatsapp_number,
      meta_pixel_id,
      google_ads_id,
    } = body;

    const existing = await queryOne(`SELECT id FROM settings WHERE id = 1`);

    if (existing) {
      await run(
        `UPDATE settings SET 
         openrouter_api_key = $1, company_name = $2, company_email = $3, 
         company_phone = $4, company_address = $5, whatsapp_number = $6,
         meta_pixel_id = $7, google_ads_id = $8, updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [openrouter_api_key, company_name, company_email, company_phone, company_address, whatsapp_number, meta_pixel_id, google_ads_id]
      );
    } else {
      await run(
        `INSERT INTO settings (id, openrouter_api_key, company_name, company_email, company_phone, company_address, whatsapp_number, meta_pixel_id, google_ads_id)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)`,
        [openrouter_api_key, company_name, company_email, company_phone, company_address, whatsapp_number, meta_pixel_id, google_ads_id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
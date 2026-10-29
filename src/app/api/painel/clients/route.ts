import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { normalizePhoneE164 } from "@/lib/lead-import";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const source = searchParams.get("source") || "";
  const intent = searchParams.get("intent") || "";
  const tag = searchParams.get("tag") || "";
  const category = searchParams.get("category") || "";
  const tier = searchParams.get("tier") || "";
  const city = searchParams.get("city") || "";
  const websiteType = searchParams.get("websiteType") || "";
  const whatsapp = searchParams.get("whatsapp") || "";
  const offerCode = searchParams.get("offerCode") || "";

  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (search) {
    whereClause += ` AND (
      c.name ILIKE $${paramIndex}
      OR c.email ILIKE $${paramIndex}
      OR c.company ILIKE $${paramIndex}
      OR c.phone ILIKE $${paramIndex}
      OR c.category ILIKE $${paramIndex}
      OR c.niche ILIKE $${paramIndex}
      OR c.neighborhood ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (source) {
    whereClause += ` AND c.source = $${paramIndex}`;
    params.push(source);
    paramIndex++;
  }

  if (intent) {
    whereClause += ` AND c.intent = $${paramIndex}`;
    params.push(intent);
    paramIndex++;
  }

  if (category) {
    whereClause += ` AND c.category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (tier) {
    whereClause += ` AND c.tier = $${paramIndex}`;
    params.push(tier);
    paramIndex++;
  }

  if (city) {
    whereClause += ` AND c.city = $${paramIndex}`;
    params.push(city);
    paramIndex++;
  }

  if (websiteType) {
    whereClause += ` AND c.website_type = $${paramIndex}`;
    params.push(websiteType);
    paramIndex++;
  }

  if (offerCode) {
    whereClause += ` AND c.offer_code = $${paramIndex}`;
    params.push(offerCode);
    paramIndex++;
  }

  if (whatsapp === "confirmado") {
    whereClause += ` AND c.whatsapp_status = 'confirmado'`;
  } else if (whatsapp === "sem_whatsapp") {
    whereClause += ` AND (c.whatsapp_status IS NULL OR c.whatsapp_status = 'nao_identificado')`;
  }

  if (tag) {
    whereClause += ` AND EXISTS (SELECT 1 FROM client_tags ct WHERE ct.client_id = c.id AND ct.tag_id = $${paramIndex})`;
    params.push(tag);
    paramIndex++;
  }

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM clients c ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0]?.count || "0");

  params.push(limit, offset);
  const rows = await query(
    `SELECT c.id, c.name, c.email, c.phone, c.company, c.source, c.intent,
      c.category, c.niche, c.tier, c.tier_label, c.city, c.state, c.neighborhood,
      c.website, c.website_type, c.whatsapp_status, c.whatsapp_link,
      c.instagram_handle, c.instagram_followers,
      c.google_reviews, c.google_rating, c.offer_code, c.recommended_service,
      c.created_at, c.updated_at,
      COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color)) FILTER (WHERE t.id IS NOT NULL), '[]') as tags
     FROM clients c
     LEFT JOIN client_tags ct ON c.id = ct.client_id
     LEFT JOIN tags t ON ct.tag_id = t.id
     ${whereClause}
     GROUP BY c.id
     ORDER BY c.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  const [categories, cities] = await Promise.all([
    query<{ category: string }>(
      `SELECT DISTINCT category FROM clients WHERE category IS NOT NULL ORDER BY category`
    ),
    query<{ city: string }>(
      `SELECT DISTINCT city FROM clients WHERE city IS NOT NULL ORDER BY city`
    ),
  ]);

  return NextResponse.json({
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    facets: {
      categories: categories.map((row) => row.category),
      cities: cities.map((row) => row.city),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, source = "manual", intent = "conhecer", tagIds, notes } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const clientResult = await query<{ id: string }>(
      `INSERT INTO clients (id, name, email, phone, phone_e164, company, source, intent, notes)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        name,
        email || null,
        phone || null,
        normalizePhoneE164(phone),
        company || null,
        source,
        intent,
        notes || null,
      ]
    );
    const clientId = clientResult[0].id;

    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await query(
          `INSERT INTO client_tags (client_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [clientId, tagId]
        );
      }
    }

    return NextResponse.json({ id: clientId }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}

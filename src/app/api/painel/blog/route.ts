import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { parsePostInput } from "@/lib/blog-post-input";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (search) {
    whereClause += ` AND (title ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex} OR slug ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM posts ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0]?.count || "0");

  params.push(limit, offset);
  const rows = await query(
    `SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return NextResponse.json({
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = await parsePostInput(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.error, field: parsed.field },
        { status: 400 }
      );
    }

    const v = parsed.values;
    const result = await query<{ id: string }>(
      `INSERT INTO posts (
         id, title, slug, content, excerpt, status, published_at, ai_generated,
         cover_image, seo_title, meta_description, agent, cta_enabled,
         scheduled_timezone, updated_at
       )
       VALUES (
         gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12, $13, NOW()
       )
       RETURNING id`,
      [
        v.title,
        v.slug,
        v.content,
        v.excerpt,
        v.status,
        v.published_at,
        v.ai_generated,
        v.cover_image,
        v.seo_title,
        v.meta_description,
        v.agent,
        v.cta_enabled,
        v.scheduled_timezone,
      ]
    );

    return NextResponse.json({ id: result[0].id, slug: v.slug }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Erro ao criar artigo" }, { status: 500 });
  }
}

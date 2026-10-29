import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  if (slug) {
    const post = await query(
      `SELECT * FROM posts
       WHERE slug = $1
         AND (
           (status = 'published' AND (published_at IS NULL OR published_at <= NOW()))
           OR (status = 'scheduled' AND published_at IS NOT NULL AND published_at <= NOW())
         )`,
      [slug]
    );
    if (!post || post.length === 0) {
      return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
    }
    return NextResponse.json(post[0]);
  }

  const offset = (page - 1) * limit;
  const rows = await query(
    `SELECT id, title, slug, excerpt, status, published_at, ai_generated, created_at 
     FROM posts 
     WHERE (status = 'published' AND (published_at IS NULL OR published_at <= NOW()))
        OR (status = 'scheduled' AND published_at IS NOT NULL AND published_at <= NOW())
     ORDER BY published_at DESC, created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM posts
     WHERE (status = 'published' AND (published_at IS NULL OR published_at <= NOW()))
        OR (status = 'scheduled' AND published_at IS NOT NULL AND published_at <= NOW())`
  );
  const total = parseInt(countResult[0]?.count || "0");

  return NextResponse.json({
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
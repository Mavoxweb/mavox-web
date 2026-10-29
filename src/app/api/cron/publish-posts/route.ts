import { NextResponse } from "next/server";
import { query, run } from "@/lib/db";

interface ScheduledPost {
  id: string;
  slug: string;
}

export async function GET(request: Request) {
  // Verificar segredo do cron (apenas Vercel Cron Jobs podem chamar)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Buscar posts agendados que devem ser publicados agora
    const scheduledPosts = await query<ScheduledPost>(
      `SELECT id, slug FROM posts 
       WHERE status = 'scheduled' 
       AND published_at IS NOT NULL 
       AND published_at <= NOW()`,
      []
    );

    const results = [];

    for (const post of scheduledPosts) {
      // Atualizar status para publicado
      await run(
        `UPDATE posts SET status = 'published', updated_at = NOW() WHERE id = $1`,
        [post.id]
      );

      results.push({
        id: post.id,
        slug: post.slug,
        action: "published"
      });
    }

    return NextResponse.json({
      success: true,
      published: results.length,
      posts: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro no cron de publicação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
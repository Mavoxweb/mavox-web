import { NextResponse } from "next/server";
import { runDailyAgent } from "@/lib/daily-agent";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runDailyAgent();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Erro no cron do agente diário:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

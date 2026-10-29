import { NextResponse } from "next/server";
import { sendEmail, testSmtpConnection } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const to: string = body.to || "";
    const verify = await testSmtpConnection();

    if (!verify.ok) {
      return NextResponse.json(
        { ok: false, stage: "connection", error: verify.error },
        { status: 400 }
      );
    }

    if (!to) {
      return NextResponse.json({ ok: true, stage: "connection" });
    }

    const sent = await sendEmail({
      to,
      subject: "Teste de SMTP — Painel Mavox",
      html: `<h2>SMTP funcionando!</h2>
<p>Este é um e-mail de teste enviado pelo painel da Mavox.</p>
<p>Se você recebeu esta mensagem, as configurações de SMTP estão corretas.</p>`,
      templateKey: "teste_smtp",
    });

    if (!sent.ok) {
      return NextResponse.json(
        { ok: false, stage: "send", error: sent.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, stage: "sent" });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erro ao testar SMTP",
      },
      { status: 500 }
    );
  }
}

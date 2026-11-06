import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "E-mail e senha são obrigatórios" }, { status: 400 });
    }

    // Buscar a conta do usuário no Neon Auth
    const account = await queryOne<{ id: string; userId: string; password: string; email: string; role: string; name: string }>(
      `SELECT a.id, a."userId", a.password, u.email, u.role, u.name
       FROM neon_auth.account a
       JOIN neon_auth.user u ON u.id = a."userId"
       WHERE a."accountId" = $1 AND a."providerId" = 'email'`,
      [email]
    );

    if (!account) {
      return NextResponse.json({ ok: false, error: "E-mail ou senha inválidos" }, { status: 401 });
    }

    // Verificar a senha com bcrypt
    const passwordValid = await bcrypt.compare(password, account.password);
    if (!passwordValid) {
      return NextResponse.json({ ok: false, error: "E-mail ou senha inválidos" }, { status: 401 });
    }

    // Criar sessão - definir cookie httpOnly
    const response = NextResponse.json({ ok: true, user: { id: account.userId, email: account.email, name: account.name, role: account.role } });
    
    const token = await signSession({
      userId: account.userId,
      email: account.email,
      name: account.name,
      role: account.role,
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);

    return response;
  } catch (err) {
    console.error("Sign-in error:", err);
    return NextResponse.json({ ok: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}
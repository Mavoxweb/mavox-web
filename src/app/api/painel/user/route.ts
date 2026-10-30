import { NextResponse } from "next/server";
import { queryOne, run } from "@/lib/db";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mavox_session")?.value;
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    // Buscar dados do usuário no Neon Auth
    const userData = await queryOne<{
      id: string;
      name: string;
      email: string;
      avatar_url: string | null;
      created_at: string;
    }>(
      `SELECT id, name, email, avatar_url, created_at FROM neon_auth.user WHERE id = $1`,
      [user.userId]
    );

    if (!userData) {
      return NextResponse.json({ ok: false, error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user: userData });
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatar_url, currentPassword, newPassword } = body;

    // Se está atualizando senha
    if (currentPassword && newPassword) {
      // Verificar senha atual
      const account = await queryOne<{ password: string }>(
        `SELECT password FROM neon_auth.account WHERE "userId" = $1 AND "providerId" = 'email'`,
        [user.userId]
      );

      if (!account) {
        return NextResponse.json({ ok: false, error: "Conta não encontrada" }, { status: 404 });
      }

      const passwordValid = await bcrypt.compare(currentPassword, account.password);
      if (!passwordValid) {
        return NextResponse.json({ ok: false, error: "Senha atual incorreta" }, { status: 400 });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await run(
        `UPDATE neon_auth.account SET password = $1 WHERE "userId" = $2 AND "providerId" = 'email'`,
        [hashedPassword, user.userId]
      );
    }

    // Atualizar nome e avatar
    if (name !== undefined || avatar_url !== undefined) {
      const updates: string[] = [];
      const values: (string | null)[] = [];

      if (name !== undefined) {
        updates.push("name = $" + (values.length + 1));
        values.push(name);
      }
      if (avatar_url !== undefined) {
        updates.push("avatar_url = $" + (values.length + 1));
        values.push(avatar_url);
      }

      if (updates.length > 0) {
        values.push(user.userId);
        await run(
          `UPDATE neon_auth.user SET ${updates.join(", ")} WHERE id = $${values.length}`,
          values
        );
      }
    }

    // Atualizar cookie da sessão se nome mudou
    if (name !== undefined) {
      const updatedUser = { ...user, name };
      const cookieStore = await cookies();
      cookieStore.set("mavox_session", JSON.stringify(updatedUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
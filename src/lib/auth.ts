export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// signIn chama nossa própria API que verifica credenciais no banco Neon Auth
export async function signIn(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || "E-mail ou senha inválidos" };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Erro de conexão com o servidor" };
  }
}

export async function signUp(email: string, password: string, name: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || "Erro ao criar usuário" };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Erro de conexão com o servidor" };
  }
}

export function getAuthCookieName(): string {
  return "mavox_session";
}
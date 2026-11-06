/**
 * Autoriza chamadas de cron. Falha FECHADO: sem CRON_SECRET configurado, nega.
 * A Vercel envia `Authorization: Bearer <CRON_SECRET>`.
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

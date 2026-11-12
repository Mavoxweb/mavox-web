// Cria uma chave de API para integrações (ex.: bot). Imprime a chave UMA vez; no banco fica só o hash.
// Uso: node --env-file=.env scripts/create-api-key.mjs "Grok Bot" clients:read,quotes:read,appointments:write
import { createHash, randomBytes } from "node:crypto";
import { Pool } from "@neondatabase/serverless";

const SCOPES = [
  "clients:read", "clients:write", "quotes:read", "quotes:write",
  "appointments:read", "appointments:write", "followups:read", "followups:write",
];

const [name, scopeArg] = process.argv.slice(2);
if (!name || !scopeArg) {
  console.error(`Uso: node --env-file=.env scripts/create-api-key.mjs "<nome>" <escopos separados por vírgula|all>\nEscopos: ${SCOPES.join(", ")}`);
  process.exit(1);
}
const scopes = scopeArg === "all" ? SCOPES : scopeArg.split(",").map((s) => s.trim());
const invalid = scopes.filter((s) => !SCOPES.includes(s));
if (invalid.length) {
  console.error(`Escopos inválidos: ${invalid.join(", ")}`);
  process.exit(1);
}

const key = `mvx_${randomBytes(32).toString("base64url")}`;
const hash = createHash("sha256").update(key).digest("hex");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(`INSERT INTO api_keys (name, key_prefix, key_hash, scopes) VALUES ($1, $2, $3, $4)`, [name, key.slice(0, 12), hash, scopes]);
  console.log(`Chave criada para "${name}" com escopos: ${scopes.join(", ")}\n\n${key}\n\nGuarde agora: ela não pode ser recuperada depois.`);
} finally {
  await pool.end();
}

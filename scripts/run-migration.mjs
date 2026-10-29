import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";

const file = process.argv[2];
if (!file) {
  console.error("Uso: node --env-file=.env scripts/run-migration.mjs <arquivo.sql>");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");

// Remove comentários de linha e divide por comandos terminados em ;
const statements = sql
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  for (const statement of statements) {
    console.log(`> ${statement.split("\n")[0].slice(0, 90)}...`);
    await client.query(statement);
  }
  console.log(`OK: ${statements.length} comandos executados.`);
} catch (error) {
  console.error("Falha na migração:", error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}

import { readFile } from "node:fs/promises";
import { Pool } from "@neondatabase/serverless";

const file = process.argv[2];
if (!file) {
  console.error("Uso: node --env-file=.env scripts/apply-sql.mjs <arquivo.sql>");
  process.exit(1);
}

const sql = await readFile(file, "utf8");
const statements = sql
  .split(/;(?:[ \t]*--[^\n]*)?[ \t]*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(
    (statement) =>
      statement &&
      !statement
        .split(/\r?\n/)
        .every((line) => !line.trim() || line.trim().startsWith("--"))
  );

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  for (const statement of statements) {
    await pool.query(statement);
    console.log("ok:", statement.split(/\r?\n/)[0].slice(0, 80));
  }
  console.log(`\n${statements.length} comandos aplicados em ${file}`);
} finally {
  await pool.end();
}

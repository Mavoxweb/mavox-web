import { Pool } from "@neondatabase/serverless";

const tags = [
  { name: "🔥 Urgente", color: "#ef4444" },
  { name: "💰 Pronto p/ Contratar", color: "#22c55e" },
  { name: "🔄 Retorno", color: "#f59e0b" },
  { name: "📱 WhatsApp Ativo", color: "#10b981" },
  { name: "🏢 Enterprise", color: "#8b5cf6" },
  { name: "⚠️ Risco Churn", color: "#ef4444" },
  { name: "🤝 Parceiro", color: "#06b6d4" },
  { name: "📋 Onboarding", color: "#3b82f6" },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  for (const tag of tags) {
    const existing = await client.query("SELECT id FROM tags WHERE name = $1", [tag.name]);
    if (existing.rows.length > 0) {
      console.log(`- já existe: ${tag.name}`);
      continue;
    }
    await client.query(
      "INSERT INTO tags (id, name, color) VALUES (gen_random_uuid(), $1, $2)",
      [tag.name, tag.color]
    );
    console.log(`+ criada: ${tag.name}`);
  }
  console.log("Seed de tags concluído.");
} catch (error) {
  console.error("Erro no seed de tags:", error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}

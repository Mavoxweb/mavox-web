#!/usr/bin/env node
// Script para popular tags iniciais no banco de dados
// Execute com: npx tsx scripts/seed-tags.ts

import { query, run, queryOne } from "@/lib/db";

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

async function seedTags() {
  console.log("Iniciando seed de tags...");

  for (const tag of tags) {
    try {
      const existing = await queryOne<{ id: string }>(
        `SELECT id FROM tags WHERE name = $1`,
        [tag.name]
      );

      if (existing) {
        console.log(`⏭️  Tag já existe: ${tag.name}`);
      } else {
        await run(
          `INSERT INTO tags (id, name, color) VALUES (gen_random_uuid(), $1, $2)`,
          [tag.name, tag.color]
        );
        console.log(`✅ Tag criada: ${tag.name} (${tag.color})`);
      }
    } catch (err) {
      console.error(`❌ Erro ao criar tag ${tag.name}:`, err);
    }
  }

  console.log("Seed de tags concluído!");
  process.exit(0);
}

seedTags().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
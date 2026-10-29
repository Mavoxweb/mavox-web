import { Pool } from "@neondatabase/serverless";

const models = {
  blog_writer: "nvidia/nemotron-3-ultra-550b-a55b:free",
  lead_analyzer: "nvidia/nemotron-3-ultra-550b-a55b:free",
  daily_agent: "nvidia/nemotron-3-ultra-550b-a55b:free",
  onboarding_assistant: "nvidia/nemotron-3-ultra-550b-a55b:free",
  followup_writer: "nvidia/nemotron-3-ultra-550b-a55b:free",
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(
  "UPDATE settings SET ai_models = $1::jsonb, daily_agent_model = $2 WHERE id = 1",
  [JSON.stringify(models), models.daily_agent]
);
const result = await pool.query(
  "SELECT ai_models, daily_agent_model FROM settings WHERE id = 1"
);
console.log(JSON.stringify(result.rows[0]));
await pool.end();

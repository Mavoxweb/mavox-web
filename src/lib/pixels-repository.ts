import { query } from "@/lib/db";

export interface PixelConfig {
  metaPixelId?: string;
  googleTagId?: string;
}

export async function getActivePixelConfigs(): Promise<PixelConfig> {
  let metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
  let googleTagId =
    process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "";

  try {
    const rows = await query<{
      name: string;
      pixel_id_meta: string | null;
      pixel_id_google: string | null;
    }>(
      `SELECT name, pixel_id_meta, pixel_id_google 
       FROM pixel_events 
       WHERE pixel_id_meta IS NOT NULL OR pixel_id_google IS NOT NULL 
       ORDER BY created_at DESC`
    );

    for (const row of rows) {
      if (!metaPixelId && row.pixel_id_meta) {
        metaPixelId = row.pixel_id_meta.trim();
      }
      if (!googleTagId && row.pixel_id_google) {
        googleTagId = row.pixel_id_google.trim();
      }
    }
  } catch (error) {
    // Retorna fallback das variáveis de ambiente em caso de falha de conexão inicial
  }

  return {
    metaPixelId: metaPixelId || undefined,
    googleTagId: googleTagId || undefined,
  };
}


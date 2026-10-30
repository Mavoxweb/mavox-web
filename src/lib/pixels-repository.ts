import { queryOne } from "@/lib/db";

export interface PixelConfig {
  metaPixelId?: string;
  gtmId?: string;
  ga4MeasurementId?: string;
  tiktokPixelId?: string;
  metaCapiAccessToken?: string;
  metaCapiPixelId?: string;
}

export async function getActivePixelConfigs(): Promise<PixelConfig> {
  let metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
  let gtmId = process.env.NEXT_PUBLIC_GTM_ID || "";
  let ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "";
  let tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "";
  let metaCapiAccessToken = process.env.META_CAPI_ACCESS_TOKEN || "";
  let metaCapiPixelId = process.env.META_CAPI_PIXEL_ID || "";

  try {
    const settings = await queryOne<{
      meta_pixel_id: string | null;
      google_ads_id: string | null;
      gtm_id: string | null;
      ga4_measurement_id: string | null;
      tiktok_pixel_id: string | null;
      meta_capi_access_token: string | null;
      meta_capi_pixel_id: string | null;
    }>(
      `SELECT meta_pixel_id, google_ads_id, gtm_id, ga4_measurement_id, tiktok_pixel_id, meta_capi_access_token, meta_capi_pixel_id
       FROM settings WHERE id = 1`
    );

    if (settings) {
      if (!metaPixelId && settings.meta_pixel_id) metaPixelId = settings.meta_pixel_id.trim();
      if (!gtmId && settings.gtm_id) gtmId = settings.gtm_id.trim();
      if (!ga4MeasurementId && settings.ga4_measurement_id) ga4MeasurementId = settings.ga4_measurement_id.trim();
      if (!tiktokPixelId && settings.tiktok_pixel_id) tiktokPixelId = settings.tiktok_pixel_id.trim();
      if (!metaCapiAccessToken && settings.meta_capi_access_token) metaCapiAccessToken = settings.meta_capi_access_token.trim();
      if (!metaCapiPixelId && settings.meta_capi_pixel_id) metaCapiPixelId = settings.meta_capi_pixel_id.trim();
      // google_ads_id fallback para compatibilidade
      if (!ga4MeasurementId && settings.google_ads_id) ga4MeasurementId = settings.google_ads_id.trim();
    }
  } catch (error) {
    // Retorna fallback das variáveis de ambiente em caso de falha de conexão inicial
  }

  return {
    metaPixelId: metaPixelId || undefined,
    gtmId: gtmId || undefined,
    ga4MeasurementId: ga4MeasurementId || undefined,
    tiktokPixelId: tiktokPixelId || undefined,
    metaCapiAccessToken: metaCapiAccessToken || undefined,
    metaCapiPixelId: metaCapiPixelId || undefined,
  };
}
import { queryOne, run } from "@/lib/db";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export interface StoredMedia {
  key: string;
  url: string;
  provider: "s3" | "database";
}

export interface MediaAssetRow {
  object_key: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  data: Uint8Array | Buffer;
}

function s3Config() {
  const bucket =
    process.env.S3_BUCKET ??
    process.env.AWS_BUCKET_NAME ??
    process.env.NEON_STORAGE_BUCKET ??
    "";
  const endpoint =
    process.env.AWS_ENDPOINT_URL_S3 ?? process.env.S3_ENDPOINT ?? "";
  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY_ID ?? "";
  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_ACCESS_KEY ?? "";
  const region = process.env.AWS_REGION ?? process.env.S3_REGION ?? "us-east-1";

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) return null;

  const publicBase =
    process.env.S3_PUBLIC_URL?.replace(/\/+$/, "") ??
    `${endpoint.replace(/\/+$/, "")}/${bucket}`;

  return { bucket, endpoint, accessKeyId, secretAccessKey, region, publicBase };
}

export function mediaProvider(): "s3" | "database" {
  return s3Config() ? "s3" : "database";
}

export function isAllowedImageType(contentType: string): boolean {
  return Boolean(ALLOWED_TYPES[contentType]);
}

function buildKey(filename: string, contentType: string): string {
  const now = new Date();
  const folder = `blog/${now.getUTCFullYear()}/${String(
    now.getUTCMonth() + 1
  ).padStart(2, "0")}`;
  const ext = ALLOWED_TYPES[contentType] ?? "bin";
  const base = filename
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${folder}/${crypto.randomUUID()}-${base || "imagem"}.${ext}`;
}

export async function saveMedia(input: {
  buffer: Buffer;
  filename: string;
  contentType: string;
}): Promise<StoredMedia> {
  const key = buildKey(input.filename, input.contentType);
  const config = s3Config();

  if (config) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    return { key, url: `${config.publicBase}/${key}`, provider: "s3" };
  }

  await run(
    `INSERT INTO media_assets (object_key, filename, content_type, size_bytes, data)
     VALUES ($1, $2, $3, $4, $5)`,
    [key, input.filename, input.contentType, input.buffer.byteLength, input.buffer]
  );

  return { key, url: `/api/media/${key}`, provider: "database" };
}

export async function getMediaAsset(key: string): Promise<MediaAssetRow | null> {
  return queryOne<MediaAssetRow>(
    `SELECT object_key, filename, content_type, size_bytes, data
     FROM media_assets WHERE object_key = $1`,
    [key]
  );
}

import { getMediaAsset } from "@/lib/media";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = key.join("/");

  const asset = await getMediaAsset(objectKey);
  if (!asset) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(asset.data as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": asset.content_type,
      "Content-Length": String(asset.size_bytes),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${asset.filename.replace(/"/g, "")}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

import { NextResponse } from "next/server";
import {
  MAX_IMAGE_BYTES,
  isAllowedImageType,
  saveMedia,
} from "@/lib/media";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Envie um arquivo no campo 'file'." },
        { status: 400 }
      );
    }

    if (!isAllowedImageType(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG, WebP, GIF ou AVIF." },
        { status: 415 }
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 5 MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await saveMedia({
      buffer,
      filename: file.name || "imagem",
      contentType: file.type,
    });

    return NextResponse.json(stored, { status: 201 });
  } catch (error) {
    console.error("Erro no upload de imagem:", error);
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem." },
      { status: 500 }
    );
  }
}

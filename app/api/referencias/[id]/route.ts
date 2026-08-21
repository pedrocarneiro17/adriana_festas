import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const referencia = await prisma.referenciaImagem.findUnique({ where: { id } });

  if (!referencia) {
    return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
  }

  const download = request.nextUrl.searchParams.has("download");

  return new NextResponse(new Uint8Array(referencia.dados), {
    headers: {
      "Content-Type": referencia.contentType,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${referencia.nomeArquivo}"`,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}

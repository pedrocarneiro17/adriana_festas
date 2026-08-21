import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventoId } = await params;

  const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
  if (!evento) {
    return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  }

  const formData = await request.formData();
  const arquivos = formData.getAll("arquivos").filter((v): v is File => v instanceof File);

  if (arquivos.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  for (const arquivo of arquivos) {
    if (!arquivo.type.startsWith("image/")) continue;
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    await prisma.referenciaImagem.create({
      data: {
        eventoId,
        nomeArquivo: arquivo.name,
        contentType: arquivo.type,
        tamanho: buffer.byteLength,
        dados: buffer,
      },
    });
  }

  revalidatePath(`/eventos/${eventoId}`);
  return NextResponse.json({ ok: true });
}

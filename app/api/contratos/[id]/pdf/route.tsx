import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import ContratoPdf from "@/lib/pdf/contrato-pdf";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: {
      cliente: true,
      orcamento: { include: { itens: { include: { produto: true } } } },
      evento: { include: { referencias: { orderBy: { criadoEm: "desc" } } } },
    },
  });

  if (!contrato) {
    return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  }

  // Normaliza cada referência pra JPEG — o formato de origem pode ser
  // qualquer um que o navegador aceitar no upload, mas o react-pdf só lida
  // com png/jpg, e isso também mantém o PDF leve.
  const referencias = await Promise.all(
    (contrato.evento?.referencias ?? []).map(async (r) => ({
      buffer: await sharp(r.dados).rotate().resize({ width: 900, withoutEnlargement: true }).jpeg({ quality: 78 }).toBuffer(),
    }))
  );

  const buffer = await renderToBuffer(<ContratoPdf contrato={contrato} referencias={referencias} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-${contrato.id}.pdf"`,
    },
  });
}

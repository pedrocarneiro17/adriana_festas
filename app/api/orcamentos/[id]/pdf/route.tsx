import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import OrcamentoPdf from "@/lib/pdf/orcamento-pdf";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const orcamento = await prisma.orcamento.findUnique({
    where: { id },
    include: { cliente: true, itens: { include: { produto: true } } },
  });

  if (!orcamento) {
    return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<OrcamentoPdf orcamento={orcamento} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orcamento-${orcamento.id}.pdf"`,
    },
  });
}

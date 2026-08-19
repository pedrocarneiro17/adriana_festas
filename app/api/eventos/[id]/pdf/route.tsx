import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import ChecklistEventoPdf from "@/lib/pdf/checklist-evento-pdf";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      contrato: {
        include: {
          cliente: true,
          orcamento: { include: { itens: { include: { produto: true } } } },
        },
      },
      checklistMateriais: { include: { itens: true } },
      tarefas: { include: { itens: true }, orderBy: { data: "asc" } },
    },
  });

  if (!evento) {
    return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<ChecklistEventoPdf evento={evento} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="checklist-evento-${evento.id}.pdf"`,
    },
  });
}

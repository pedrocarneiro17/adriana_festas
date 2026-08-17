"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { formatBRL } from "@/lib/utils";

async function revalidateEventoDoContrato(contratoId: string) {
  const evento = await prisma.evento.findUnique({ where: { contratoId } });
  if (evento) revalidatePath(`/eventos/${evento.id}`);
  revalidatePath("/eventos");
}

export async function assinarContrato(id: string, assinado: boolean) {
  await prisma.contrato.update({
    where: { id },
    data: { assinado, dataAssinatura: assinado ? new Date() : null },
  });
  await revalidateEventoDoContrato(id);
}

export async function atualizarCondicoesPagamento(id: string, condicoesPagamento: string) {
  await prisma.contrato.update({ where: { id }, data: { condicoesPagamento } });
  await revalidateEventoDoContrato(id);
}

// Ao cancelar, é possível informar uma multa contratual: o total do
// orçamento passa a valer só esse valor (em vez do valor cheio do contrato),
// então saldo, "Registrar pagamento" e margem do evento já refletem a multa
// sem precisar de nenhuma edição manual depois.
export async function cancelarContrato(id: string, multa?: number, motivo?: string) {
  await prisma.$transaction(async (tx) => {
    const contrato = await tx.contrato.update({ where: { id }, data: { status: "cancelado" } });
    const evento = await tx.evento.findUnique({ where: { contratoId: id } });
    if (evento) {
      await tx.evento.update({ where: { id: evento.id }, data: { status: "cancelado" } });
    }

    if (typeof multa === "number") {
      const orcamento = await tx.orcamento.findUniqueOrThrow({ where: { id: contrato.orcamentoId } });
      const nota = `Evento cancelado — multa contratual de ${formatBRL(multa)} aplicada.${motivo ? ` Motivo: ${motivo}.` : ""}`;
      await tx.orcamento.update({
        where: { id: orcamento.id },
        data: {
          total: multa,
          observacoes: [orcamento.observacoes, nota].filter(Boolean).join(" "),
        },
      });
    }
  });
  await revalidateEventoDoContrato(id);
  revalidatePath("/agenda");
  revalidatePath("/financeiro");
  revalidatePath("/orcamentos");
}

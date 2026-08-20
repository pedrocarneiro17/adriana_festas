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

export async function atualizarDataAssinatura(id: string, data: string) {
  await prisma.contrato.update({
    where: { id },
    data: { dataAssinatura: new Date(`${data}T12:00:00.000Z`) },
  });
  await revalidateEventoDoContrato(id);
}

export async function atualizarCondicoesPagamento(id: string, condicoesPagamento: string) {
  await prisma.contrato.update({ where: { id }, data: { condicoesPagamento } });
  await revalidateEventoDoContrato(id);
}

export async function atualizarSomenteDecoracao(id: string, somenteDecoracao: boolean) {
  await prisma.contrato.update({ where: { id }, data: { somenteDecoracao } });
  await revalidateEventoDoContrato(id);
}

// Ao cancelar, é possível informar uma multa contratual. O valor original
// combinado (orcamento.total) nunca é sobrescrito — a multa fica guardada à
// parte em contrato.valorMulta, e é esse valor que passa a valer pra
// saldo/pagamento/margem sempre que estiver preenchido.
export async function cancelarContrato(id: string, multa?: number, motivo?: string) {
  await prisma.$transaction(async (tx) => {
    await tx.contrato.update({
      where: { id },
      data: { status: "cancelado", valorMulta: typeof multa === "number" ? multa : undefined },
    });
    const evento = await tx.evento.findUnique({ where: { contratoId: id } });
    if (evento) {
      await tx.evento.update({ where: { id: evento.id }, data: { status: "cancelado" } });
    }

    if (typeof multa === "number") {
      const contrato = await tx.contrato.findUniqueOrThrow({ where: { id } });
      const orcamento = await tx.orcamento.findUniqueOrThrow({ where: { id: contrato.orcamentoId } });
      const nota = `Evento cancelado — multa contratual de ${formatBRL(multa)} aplicada (valor original do contrato: ${formatBRL(orcamento.total.toString())}).${motivo ? ` Motivo: ${motivo}.` : ""}`;
      await tx.orcamento.update({
        where: { id: orcamento.id },
        data: { observacoes: [orcamento.observacoes, nota].filter(Boolean).join(" ") },
      });
    }
  });
  await revalidateEventoDoContrato(id);
  revalidatePath("/agenda");
  revalidatePath("/financeiro");
  revalidatePath("/orcamentos");
}

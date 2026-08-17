"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function cancelarContrato(id: string) {
  await prisma.$transaction(async (tx) => {
    await tx.contrato.update({ where: { id }, data: { status: "cancelado" } });
    const evento = await tx.evento.findUnique({ where: { contratoId: id } });
    if (evento) {
      await tx.evento.update({ where: { id: evento.id }, data: { status: "cancelado" } });
    }
  });
  await revalidateEventoDoContrato(id);
  revalidatePath("/agenda");
}

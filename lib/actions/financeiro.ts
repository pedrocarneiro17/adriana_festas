"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function revalidateEventoDoContrato(contratoId: string) {
  const evento = await prisma.evento.findUnique({ where: { contratoId } });
  if (evento) revalidatePath(`/eventos/${evento.id}`);
  revalidatePath("/eventos");
}

export async function registrarPagamento(
  contratoId: string,
  data: { valor: number; data: string; formaPagamento: string }
) {
  await prisma.pagamento.create({
    data: {
      contratoId,
      valor: data.valor,
      data: new Date(`${data.data}T12:00:00.000Z`),
      formaPagamento: data.formaPagamento || null,
    },
  });
  revalidatePath("/financeiro");
  await revalidateEventoDoContrato(contratoId);
  revalidatePath("/dashboard");
}

export async function excluirPagamento(id: string) {
  const pagamento = await prisma.pagamento.delete({ where: { id } });
  revalidatePath("/financeiro");
  await revalidateEventoDoContrato(pagamento.contratoId);
  revalidatePath("/dashboard");
}

export async function criarDespesa(data: {
  descricao: string;
  valor: number;
  data: string;
  eventoId: string;
}) {
  await prisma.despesa.create({
    data: {
      descricao: data.descricao,
      valor: data.valor,
      data: new Date(`${data.data}T12:00:00.000Z`),
      eventoId: data.eventoId,
    },
  });
  revalidatePath("/financeiro");
  revalidatePath(`/eventos/${data.eventoId}`);
}

export async function excluirDespesa(id: string) {
  const despesa = await prisma.despesa.delete({ where: { id } });
  revalidatePath("/financeiro");
  revalidatePath(`/eventos/${despesa.eventoId}`);
}

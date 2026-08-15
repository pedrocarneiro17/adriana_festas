"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

// Uma data-alvo está bloqueada se cair dentro de [data, dataFim ?? data] de algum registro.
function whereDataBloqueadaContem(dataISO: string): Prisma.DataBloqueadaWhereInput {
  const inicioDia = new Date(`${dataISO}T00:00:00.000Z`);
  const fimDia = new Date(`${dataISO}T23:59:59.999Z`);
  return {
    data: { lte: fimDia },
    OR: [{ dataFim: { gte: inicioDia } }, { dataFim: null, data: { gte: inicioDia } }],
  };
}

export async function verificarConflitosData(dataISO: string, eventoIdExcluir?: string) {
  const inicio = new Date(`${dataISO}T00:00:00.000Z`);
  const fim = new Date(`${dataISO}T23:59:59.999Z`);

  const [eventosConflitantes, dataBloqueada] = await Promise.all([
    prisma.evento.findMany({
      where: {
        data: { gte: inicio, lte: fim },
        status: { not: "cancelado" },
        ...(eventoIdExcluir ? { id: { not: eventoIdExcluir } } : {}),
      },
      include: { contrato: { include: { cliente: true } } },
    }),
    prisma.dataBloqueada.findFirst({ where: whereDataBloqueadaContem(dataISO) }),
  ]);

  return { eventosConflitantes, dataBloqueada };
}

export async function verificarDataBloqueada(dataISO: string) {
  return prisma.dataBloqueada.findFirst({ where: whereDataBloqueadaContem(dataISO) });
}

export async function moverEvento(eventoId: string, novaDataISO: string) {
  await prisma.evento.update({
    where: { id: eventoId },
    data: { data: new Date(`${novaDataISO}T12:00:00.000Z`) },
  });
  revalidatePath("/agenda");
  revalidatePath(`/eventos/${eventoId}`);
  revalidatePath("/eventos");
}

export async function atualizarStatusEvento(
  eventoId: string,
  status: "agendado" | "em_execucao" | "concluido" | "cancelado"
) {
  await prisma.evento.update({ where: { id: eventoId }, data: { status } });
  revalidatePath("/agenda");
  revalidatePath(`/eventos/${eventoId}`);
  revalidatePath("/eventos");
  revalidatePath("/dashboard");
}

export async function atualizarNomeEvento(eventoId: string, nome: string) {
  await prisma.evento.update({ where: { id: eventoId }, data: { nome: nome || null } });
  revalidatePath(`/eventos/${eventoId}`);
  revalidatePath("/eventos");
  revalidatePath("/agenda");
}

export async function criarDataBloqueada(dataISO: string, dataFimISO: string | null, motivo: string) {
  const data = new Date(`${dataISO}T12:00:00.000Z`);
  const dataFim = dataFimISO && dataFimISO !== dataISO ? new Date(`${dataFimISO}T12:00:00.000Z`) : null;
  await prisma.dataBloqueada.create({
    data: { data, dataFim, motivo: motivo || null },
  });
  revalidatePath("/agenda");
}

export async function removerDataBloqueada(id: string) {
  await prisma.dataBloqueada.delete({ where: { id } });
  revalidatePath("/agenda");
}

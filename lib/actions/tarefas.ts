"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function revalidateTarefa(tarefaId: string) {
  const tarefa = await prisma.tarefa.findUnique({ where: { id: tarefaId } });
  if (tarefa?.eventoId) revalidatePath(`/eventos/${tarefa.eventoId}`);
}

export async function criarTarefa(data: {
  titulo: string;
  data: string; // yyyy-mm-dd
  eventoId?: string | null;
  itens: string[];
}) {
  await prisma.tarefa.create({
    data: {
      titulo: data.titulo,
      data: new Date(`${data.data}T12:00:00.000Z`),
      eventoId: data.eventoId || null,
      itens: { create: data.itens.filter((i) => i.trim() !== "").map((descricao) => ({ descricao })) },
    },
  });
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  if (data.eventoId) revalidatePath(`/eventos/${data.eventoId}`);
}

export async function alternarItemTarefa(itemId: string, concluido: boolean) {
  const item = await prisma.tarefaItem.update({ where: { id: itemId }, data: { concluido } });
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  await revalidateTarefa(item.tarefaId);
}

export async function adicionarItemTarefa(tarefaId: string, descricao: string) {
  if (!descricao.trim()) return;
  await prisma.tarefaItem.create({ data: { tarefaId, descricao } });
  revalidatePath("/agenda");
  await revalidateTarefa(tarefaId);
}

export async function excluirTarefa(id: string) {
  await revalidateTarefa(id);
  await prisma.tarefa.delete({ where: { id } });
  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}

export async function alternarChecklistMaterial(itemId: string, tenho: boolean) {
  await prisma.checklistMaterialItem.update({ where: { id: itemId }, data: { tenho } });
  revalidatePath("/agenda");
}

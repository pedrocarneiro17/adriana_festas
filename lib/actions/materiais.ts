"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function criarMaterial(data: { nome: string; unidade: string }) {
  await prisma.material.create({
    data: { nome: data.nome.trim(), unidade: data.unidade },
  });
  revalidatePath("/materiais");
  revalidatePath("/produtos");
}

export async function atualizarMaterial(id: string, data: { nome: string; unidade: string }) {
  await prisma.material.update({
    where: { id },
    data: { nome: data.nome.trim(), unidade: data.unidade },
  });
  revalidatePath("/materiais");
  revalidatePath("/produtos");
}

export async function alternarAtivoMaterial(id: string, ativo: boolean) {
  await prisma.material.update({ where: { id }, data: { ativo } });
  revalidatePath("/materiais");
  revalidatePath("/produtos");
}

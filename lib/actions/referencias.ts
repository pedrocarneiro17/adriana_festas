"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function excluirReferencia(id: string) {
  const referencia = await prisma.referenciaImagem.delete({ where: { id } });
  revalidatePath(`/eventos/${referencia.eventoId}`);
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ClienteInput = {
  nome: string;
  telefone?: string;
  endereco?: string;
  documento?: string;
  observacoes?: string;
};

export async function criarCliente(data: ClienteInput) {
  const cliente = await prisma.cliente.create({
    data: {
      nome: data.nome,
      telefone: data.telefone || null,
      endereco: data.endereco || null,
      documento: data.documento || null,
      observacoes: data.observacoes || null,
    },
  });
  revalidatePath("/clientes");
  return cliente;
}

export async function atualizarCliente(id: string, data: ClienteInput) {
  await prisma.cliente.update({
    where: { id },
    data: {
      nome: data.nome,
      telefone: data.telefone || null,
      endereco: data.endereco || null,
      documento: data.documento || null,
      observacoes: data.observacoes || null,
    },
  });
  revalidatePath("/clientes");
}

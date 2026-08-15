"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ProdutoMaterialInput = {
  materialId: string;
  quantidadeNecessaria: number;
};

export async function criarProduto(data: {
  nome: string;
  valorUnitario: number;
  categoria?: string;
  unidade: string;
  materiais: ProdutoMaterialInput[];
}) {
  await prisma.produto.create({
    data: {
      nome: data.nome,
      valorUnitario: data.valorUnitario,
      categoria: data.categoria || null,
      unidade: data.unidade,
      materiais: {
        create: data.materiais.map((m) => ({
          materialId: m.materialId,
          quantidadeNecessaria: m.quantidadeNecessaria,
        })),
      },
    },
  });
  revalidatePath("/produtos");
}

export async function atualizarProduto(
  id: string,
  data: {
    nome: string;
    valorUnitario: number;
    categoria?: string;
    unidade: string;
    materiais: ProdutoMaterialInput[];
  }
) {
  await prisma.$transaction([
    prisma.produtoMaterial.deleteMany({ where: { produtoId: id } }),
    prisma.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        valorUnitario: data.valorUnitario,
        categoria: data.categoria || null,
        unidade: data.unidade,
        materiais: {
          create: data.materiais.map((m) => ({
            materialId: m.materialId,
            quantidadeNecessaria: m.quantidadeNecessaria,
          })),
        },
      },
    }),
  ]);
  revalidatePath("/produtos");
}

export async function alternarAtivoProduto(id: string, ativo: boolean) {
  await prisma.produto.update({ where: { id }, data: { ativo } });
  revalidatePath("/produtos");
}

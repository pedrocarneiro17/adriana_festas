"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ItemInput = {
  produtoId: string;
  quantidade: number;
};

export type OrcamentoFormInput = {
  clienteId?: string;
  clienteNovo?: {
    nome: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    documento?: string;
  };
  validadeAte?: string; // yyyy-mm-dd
  desconto: number;
  observacoes?: string;
  itens: ItemInput[];
};

async function calcularItensComPreco(itens: ItemInput[]) {
  const produtos = await prisma.produto.findMany({
    where: { id: { in: itens.map((i) => i.produtoId) } },
  });
  const produtoMap = new Map(produtos.map((p) => [p.id, p]));

  return itens.map((item) => {
    const produto = produtoMap.get(item.produtoId);
    if (!produto) throw new Error("Produto não encontrado");
    const valorUnitario = Number(produto.valorUnitario);
    const subtotal = valorUnitario * item.quantidade;
    return {
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      valorUnitarioCongelado: valorUnitario,
      subtotal,
    };
  });
}

function calcularTotal(itens: { subtotal: number }[], desconto: number) {
  const bruto = itens.reduce((acc, i) => acc + i.subtotal, 0);
  return Math.max(0, bruto - desconto);
}

export async function criarOrcamento(data: OrcamentoFormInput) {
  let clienteId = data.clienteId;

  if (!clienteId && data.clienteNovo) {
    const cliente = await prisma.cliente.create({
      data: {
        nome: data.clienteNovo.nome,
        telefone: data.clienteNovo.telefone || null,
        email: data.clienteNovo.email || null,
        endereco: data.clienteNovo.endereco || null,
        documento: data.clienteNovo.documento || null,
      },
    });
    clienteId = cliente.id;
  }

  if (!clienteId) throw new Error("Cliente é obrigatório");

  const itensComPreco = await calcularItensComPreco(data.itens);
  const total = calcularTotal(itensComPreco, data.desconto);

  const orcamento = await prisma.orcamento.create({
    data: {
      clienteId,
      status: "rascunho",
      desconto: data.desconto,
      total,
      versao: 1,
      validadeAte: data.validadeAte ? new Date(`${data.validadeAte}T12:00:00.000Z`) : null,
      observacoes: data.observacoes || null,
      itens: { create: itensComPreco },
    },
  });

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${orcamento.id}`);
}

export async function atualizarOrcamentoRascunho(id: string, data: OrcamentoFormInput) {
  const orcamento = await prisma.orcamento.findUniqueOrThrow({ where: { id } });

  if (orcamento.status === "aprovado") {
    // reajuste: não edita em memória, cria nova versão
    return reajustarOrcamento(id, data);
  }

  const itensComPreco = await calcularItensComPreco(data.itens);
  const total = calcularTotal(itensComPreco, data.desconto);

  await prisma.$transaction([
    prisma.orcamentoItem.deleteMany({ where: { orcamentoId: id } }),
    prisma.orcamento.update({
      where: { id },
      data: {
        desconto: data.desconto,
        total,
        validadeAte: data.validadeAte ? new Date(`${data.validadeAte}T12:00:00.000Z`) : null,
        observacoes: data.observacoes || null,
        itens: { create: itensComPreco },
      },
    }),
  ]);

  revalidatePath(`/orcamentos/${id}`);
  revalidatePath("/orcamentos");
}

// Regra de negócio: reajustar orçamento já aprovado.
// O orçamento atual vira pendente_reajuste, uma nova versão é criada,
// e o contrato vinculado vira pendente_revisao.
export async function reajustarOrcamento(orcamentoOrigemId: string, data: OrcamentoFormInput) {
  const origem = await prisma.orcamento.findUniqueOrThrow({
    where: { id: orcamentoOrigemId },
    include: { contrato: true },
  });

  const itensComPreco = await calcularItensComPreco(data.itens);
  const total = calcularTotal(itensComPreco, data.desconto);

  const novoOrcamento = await prisma.$transaction(async (tx) => {
    await tx.orcamento.update({
      where: { id: orcamentoOrigemId },
      data: { status: "pendente_reajuste" },
    });

    if (origem.contrato) {
      await tx.contrato.update({
        where: { id: origem.contrato.id },
        data: { status: "pendente_revisao" },
      });
    }

    return tx.orcamento.create({
      data: {
        clienteId: origem.clienteId,
        status: "rascunho",
        desconto: data.desconto,
        total,
        versao: origem.versao + 1,
        origemId: origem.origemId || origem.id,
        validadeAte: data.validadeAte ? new Date(`${data.validadeAte}T12:00:00.000Z`) : null,
        observacoes: data.observacoes || null,
        itens: { create: itensComPreco },
      },
    });
  });

  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${orcamentoOrigemId}`);
  redirect(`/orcamentos/${novoOrcamento.id}`);
}

export async function mudarStatusOrcamento(
  id: string,
  status: "enviado" | "recusado"
) {
  await prisma.orcamento.update({ where: { id }, data: { status } });
  revalidatePath(`/orcamentos/${id}`);
  revalidatePath("/orcamentos");
}

export async function duplicarOrcamento(id: string) {
  const original = await prisma.orcamento.findUniqueOrThrow({
    where: { id },
    include: { itens: true },
  });

  const copia = await prisma.orcamento.create({
    data: {
      clienteId: original.clienteId,
      status: "rascunho",
      desconto: original.desconto,
      total: original.total,
      versao: 1,
      observacoes: original.observacoes,
      itens: {
        create: original.itens.map((i) => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          valorUnitarioCongelado: i.valorUnitarioCongelado,
          subtotal: i.subtotal,
        })),
      },
    },
  });

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${copia.id}`);
}

// Regra de negócio principal: aprovar orçamento gera Contrato + Evento.
// Os pagamentos não seguem um cronograma fixo — são lançados manualmente
// no financeiro conforme forem recebidos.
export type AprovarOrcamentoInput = {
  nome?: string;
  dataEvento: string; // yyyy-mm-dd
  horario?: string;
  local?: string;
  condicoesPagamento?: string;
};

export async function aprovarOrcamento(orcamentoId: string, input: AprovarOrcamentoInput) {
  const orcamento = await prisma.orcamento.findUniqueOrThrow({
    where: { id: orcamentoId },
    include: {
      itens: { include: { produto: { include: { materiais: { include: { material: true } } } } } },
    },
  });

  const dataEvento = new Date(`${input.dataEvento}T12:00:00.000Z`);

  // Agrega materiais necessários: quantidadeNecessaria * item.quantidade
  const materiaisAgregados = new Map<string, { unidade: string; quantidade: number }>();
  for (const item of orcamento.itens) {
    for (const produtoMaterial of item.produto.materiais) {
      const key = produtoMaterial.material.nome.trim().toLowerCase();
      const qtdItem = Number(item.quantidade);
      const qtdNecessaria = Number(produtoMaterial.quantidadeNecessaria) * qtdItem;
      const existente = materiaisAgregados.get(key);
      if (existente) {
        existente.quantidade += qtdNecessaria;
      } else {
        materiaisAgregados.set(key, { unidade: produtoMaterial.material.unidade, quantidade: qtdNecessaria });
      }
    }
  }

  const evento = await prisma.$transaction(async (tx) => {
    await tx.orcamento.update({ where: { id: orcamentoId }, data: { status: "aprovado" } });

    const novoContrato = await tx.contrato.create({
      data: {
        orcamentoId,
        clienteId: orcamento.clienteId,
        status: "ativo",
        condicoesPagamento: input.condicoesPagamento || null,
      },
    });

    const novoEvento = await tx.evento.create({
      data: {
        contratoId: novoContrato.id,
        nome: input.nome || null,
        data: dataEvento,
        horario: input.horario || null,
        local: input.local || null,
        status: "agendado",
      },
    });

    if (materiaisAgregados.size > 0) {
      await tx.checklistMateriais.create({
        data: {
          eventoId: novoEvento.id,
          itens: {
            create: Array.from(materiaisAgregados.entries()).map(([nome, v]) => ({
              materialNome: nome,
              quantidadeTotalNecessaria: v.quantidade,
              unidade: v.unidade,
            })),
          },
        },
      });
    }

    return novoEvento;
  });

  revalidatePath("/orcamentos");
  revalidatePath("/eventos");
  revalidatePath("/agenda");
  redirect(`/eventos/${evento.id}`);
}

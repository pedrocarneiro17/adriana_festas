import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrcamentoForm from "../../orcamento-form";

export default async function EditarOrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [orcamento, clientes, produtos] = await Promise.all([
    prisma.orcamento.findUnique({ where: { id }, include: { itens: true } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  if (!orcamento) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Editar orçamento</h1>
        {orcamento.status === "aprovado" && (
          <p className="text-sm text-amber-700">
            Este orçamento já está aprovado. Ao salvar, uma nova versão será criada para reenvio e o
            orçamento atual ficará marcado como pendente de reajuste.
          </p>
        )}
      </div>
      <OrcamentoForm
        orcamentoId={orcamento.id}
        clientes={clientes.map((c) => ({ id: c.id, nome: c.nome }))}
        produtos={produtos.map((p) => ({ id: p.id, nome: p.nome, valorUnitario: p.valorUnitario.toString() }))}
        initial={{
          clienteId: orcamento.clienteId,
          desconto: orcamento.desconto.toString(),
          validadeAte: orcamento.validadeAte?.toISOString() ?? null,
          observacoes: orcamento.observacoes,
          itens: orcamento.itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade.toString() })),
        }}
      />
    </div>
  );
}

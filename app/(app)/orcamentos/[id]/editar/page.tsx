import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrcamentoForm from "../../orcamento-form";

export default async function EditarOrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [orcamento, clientes, produtos] = await Promise.all([
    prisma.orcamento.findUnique({
      where: { id },
      include: { itens: true, contrato: { include: { evento: true } } },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  if (!orcamento) notFound();

  // Com evento já criado, ele é a fonte da verdade (a data pode ter sido movida na agenda).
  const evento = orcamento.contrato?.evento;
  const dataEvento = evento ? evento.data : orcamento.dataEvento;
  const localEvento = evento ? evento.local : orcamento.localEvento;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Editar orçamento</h1>
        {orcamento.status === "aprovado" && (
          <p className="text-sm text-amber-700">
            Este orçamento já está aprovado. As alterações são salvas neste mesmo orçamento — se ele já
            tiver um evento vinculado, o checklist de materiais é recalculado automaticamente.
          </p>
        )}
      </div>
      <OrcamentoForm
        orcamentoId={orcamento.id}
        clientes={clientes.map((c) => ({ id: c.id, nome: c.nome }))}
        produtos={produtos.map((p) => ({
          id: p.id,
          nome: p.nome,
          valorUnitario: p.valorUnitario.toString(),
          categoria: p.categoria,
          descricao: p.descricao,
        }))}
        initial={{
          clienteId: orcamento.clienteId,
          desconto: orcamento.desconto.toString(),
          validadeAte: orcamento.validadeAte?.toISOString() ?? null,
          dataEvento: dataEvento?.toISOString() ?? null,
          localEvento: localEvento ?? null,
          observacoes: orcamento.observacoes,
          itens: orcamento.itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade.toString() })),
        }}
      />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import OrcamentoForm from "../orcamento-form";

export default async function NovoOrcamentoPage() {
  const [clientes, produtos] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Novo orçamento</h1>
        <p className="text-sm text-sand-600">Monte o orçamento com os itens e o cliente</p>
      </div>
      <OrcamentoForm
        clientes={clientes.map((c) => ({ id: c.id, nome: c.nome }))}
        produtos={produtos.map((p) => ({ id: p.id, nome: p.nome, valorUnitario: p.valorUnitario.toString() }))}
      />
    </div>
  );
}

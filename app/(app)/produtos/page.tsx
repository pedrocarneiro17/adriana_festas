import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";
import ProdutoFormDialog from "./produto-form-dialog";
import ProdutoAtivoToggle from "./produto-ativo-toggle";

export default async function ProdutosPage() {
  const [produtos, materiaisCatalogo] = await Promise.all([
    prisma.produto.findMany({
      include: { materiais: { include: { material: true } } },
      orderBy: { nome: "asc" },
    }),
    prisma.material.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  const materiaisOptions = materiaisCatalogo.map((m) => ({ id: m.id, nome: m.nome, unidade: m.unidade }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos &amp; Serviços</h1>
          <p className="text-sm text-sand-600">Catálogo de itens usados nos orçamentos</p>
        </div>
        <ProdutoFormDialog materiaisCatalogo={materiaisOptions} />
      </div>

      <div className="rounded-[28px] bg-[var(--color-surface)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor unitário</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Materiais</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell>{p.categoria || "-"}</TableCell>
                <TableCell>{formatBRL(p.valorUnitario.toString())}</TableCell>
                <TableCell>{p.unidade}</TableCell>
                <TableCell>{p.materiais.length}</TableCell>
                <TableCell>
                  {p.ativo ? (
                    <Badge variant="success">Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ProdutoFormDialog
                      produto={{
                        id: p.id,
                        nome: p.nome,
                        valorUnitario: p.valorUnitario.toString(),
                        categoria: p.categoria,
                        unidade: p.unidade,
                        materiais: p.materiais.map((m) => ({
                          materialId: m.materialId,
                          quantidadeNecessaria: m.quantidadeNecessaria.toString(),
                        })),
                      }}
                      materiaisCatalogo={materiaisOptions}
                    />
                    <ProdutoAtivoToggle id={p.id} ativo={p.ativo} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {produtos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sand-500">
                  Nenhum produto cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

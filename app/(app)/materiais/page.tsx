import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import MaterialFormDialog from "./material-form-dialog";
import MaterialAtivoToggle from "./material-ativo-toggle";

export default async function MateriaisPage() {
  const materiais = await prisma.material.findMany({
    include: { _count: { select: { produtos: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Materiais</h1>
          <p className="text-sm text-sand-600">Catálogo usado nos produtos, para montar o checklist de cada evento</p>
        </div>
        <MaterialFormDialog />
      </div>

      <div className="rounded-[28px] bg-[var(--color-surface)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Usado em</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materiais.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.nome}</TableCell>
                <TableCell>{m.unidade}</TableCell>
                <TableCell>{m._count.produtos} produto(s)</TableCell>
                <TableCell>
                  {m.ativo ? <Badge variant="success">Ativo</Badge> : <Badge variant="secondary">Inativo</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <MaterialFormDialog material={m} />
                    <MaterialAtivoToggle id={m.id} ativo={m.ativo} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {materiais.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sand-500">
                  Nenhum material cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import ClienteFormDialog from "./cliente-form-dialog";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-sand-600">Cadastro e histórico de clientes</p>
        </div>
        <ClienteFormDialog />
      </div>

      <div className="rounded-[28px] bg-[var(--color-surface)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <Link href={`/clientes/${c.id}`} className="text-brand-700 hover:underline">
                    {c.nome}
                  </Link>
                </TableCell>
                <TableCell>{c.telefone || "-"}</TableCell>
                <TableCell>{c.endereco || "-"}</TableCell>
                <TableCell>{c.documento || "-"}</TableCell>
                <TableCell className="text-right">
                  <ClienteFormDialog cliente={c} />
                </TableCell>
              </TableRow>
            ))}
            {clientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sand-500">
                  Nenhum cliente cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

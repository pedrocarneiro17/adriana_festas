import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  rascunho: "secondary",
  enviado: "default",
  aprovado: "success",
  recusado: "destructive",
  pendente_reajuste: "warning",
};

const statusLabel: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
  pendente_reajuste: "Pendente reajuste",
};

export default async function OrcamentosPage() {
  const orcamentos = await prisma.orcamento.findMany({
    include: { cliente: true },
    orderBy: { dataCriacao: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-sm text-sand-600">Fluxo de orçamentos até aprovação</p>
        </div>
        <Button asChild>
          <Link href="/orcamentos/novo">
            <Plus className="h-4 w-4" /> Novo orçamento
          </Link>
        </Button>
      </div>

      <div className="rounded-[28px] bg-[var(--color-surface)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Versão</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orcamentos.map((o) => (
              <TableRow key={o.id} className="cursor-pointer">
                <TableCell className="font-medium">
                  <Link href={`/orcamentos/${o.id}`} className="text-brand-700 hover:underline">
                    {o.cliente.nome}
                  </Link>
                </TableCell>
                <TableCell>{formatDate(o.dataCriacao)}</TableCell>
                <TableCell>v{o.versao}</TableCell>
                <TableCell>{formatBRL(o.total.toString())}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[o.status]}>{statusLabel[o.status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {orcamentos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sand-500">
                  Nenhum orçamento cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

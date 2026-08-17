import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/utils";
import ClickableRow from "@/components/clickable-row";
import EventosFiltros from "./eventos-filtros";
import type { Prisma } from "@prisma/client";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  agendado: "default",
  em_execucao: "warning",
  concluido: "success",
  cancelado: "destructive",
};

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; status?: string; de?: string; ate?: string }>;
}) {
  const { cliente, status, de, ate } = await searchParams;

  const where: Prisma.EventoWhereInput = {};
  if (cliente) where.contrato = { clienteId: cliente };
  if (status) where.status = status;
  if (de || ate) {
    where.data = {
      ...(de ? { gte: new Date(`${de}T00:00:00.000Z`) } : {}),
      ...(ate ? { lte: new Date(`${ate}T23:59:59.999Z`) } : {}),
    };
  }

  const [eventos, clientes] = await Promise.all([
    prisma.evento.findMany({
      where,
      include: { contrato: { include: { cliente: true, orcamento: true, pagamentos: true } } },
      orderBy: { data: "desc" },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Eventos</h1>
        <p className="text-sm text-sand-600">Cada evento aprovado vira um registro com tudo dentro dele</p>
      </div>

      <EventosFiltros clientes={clientes.map((c) => ({ id: c.id, nome: c.nome }))} />

      <div className="rounded-[28px] bg-[var(--color-surface)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventos.map((e) => {
              const total = Number(e.contrato.valorMulta ?? e.contrato.orcamento.total);
              const pago = e.contrato.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
              const saldo = Math.max(0, total - pago);
              return (
                <ClickableRow key={e.id} href={`/eventos/${e.id}`}>
                  <TableCell className="font-medium">{e.nome || "Evento sem nome"}</TableCell>
                  <TableCell>{e.contrato.cliente.nome}</TableCell>
                  <TableCell>{formatDate(e.data)}</TableCell>
                  <TableCell>{formatBRL(total)}</TableCell>
                  <TableCell>{formatBRL(saldo)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[e.status]}>{e.status.replace("_", " ")}</Badge>
                  </TableCell>
                </ClickableRow>
              );
            })}
            {eventos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sand-500">
                  Nenhum evento encontrado com esses filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

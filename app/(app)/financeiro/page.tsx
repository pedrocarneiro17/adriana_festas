import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/utils";
import RegistrarPagamentoDialog from "./registrar-pagamento-dialog";
import FinanceiroFiltros from "./financeiro-filtros";
import ClickableRow from "@/components/clickable-row";
import StopRowClick from "@/components/stop-row-click";
import type { Prisma } from "@prisma/client";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; de?: string; ate?: string }>;
}) {
  const { cliente, de, ate } = await searchParams;

  const periodoEvento: Prisma.DateTimeFilter = {};
  if (de) periodoEvento.gte = new Date(`${de}T00:00:00.000Z`);
  if (ate) periodoEvento.lte = new Date(`${ate}T23:59:59.999Z`);
  const temPeriodo = Boolean(de || ate);

  const contratoWhere: Prisma.ContratoWhereInput = {
    status: { not: "cancelado" },
    ...(cliente ? { clienteId: cliente } : {}),
    ...(temPeriodo ? { evento: { data: periodoEvento } } : {}),
  };
  const eventoWhere: Prisma.EventoWhereInput = {
    ...(cliente ? { contrato: { clienteId: cliente } } : {}),
    ...(temPeriodo ? { data: periodoEvento } : {}),
  };
  const despesaWhere: Prisma.DespesaWhereInput = {
    ...(cliente ? { evento: { contrato: { clienteId: cliente } } } : {}),
    ...(temPeriodo ? { evento: { data: periodoEvento } } : {}),
  };

  const [contratos, despesas, eventos, clientes] = await Promise.all([
    prisma.contrato.findMany({
      where: contratoWhere,
      include: { cliente: true, orcamento: true, evento: true, pagamentos: { orderBy: { data: "desc" } } },
      orderBy: { criadoEm: "desc" },
    }),
    prisma.despesa.findMany({
      where: despesaWhere,
      include: { evento: { include: { contrato: { include: { cliente: true } } } } },
      orderBy: { data: "desc" },
    }),
    prisma.evento.findMany({
      where: eventoWhere,
      include: {
        contrato: { include: { cliente: true, orcamento: true } },
        despesas: true,
      },
      orderBy: { data: "desc" },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const contratosComSaldo = contratos.map((c) => {
    const total = Number(c.orcamento.total);
    const pago = c.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
    return { ...c, total, pago, saldo: Math.max(0, total - pago) };
  });

  const totalContratado = contratosComSaldo.reduce((acc, c) => acc + c.total, 0);
  const totalRecebido = contratosComSaldo.reduce((acc, c) => acc + c.pago, 0);
  const totalDespesas = despesas.reduce((acc, d) => acc + Number(d.valor), 0);
  const aReceber = totalContratado - totalRecebido;
  const saldoCaixa = totalRecebido - totalDespesas;

  const comSaldoPendente = contratosComSaldo.filter((c) => c.saldo > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-sm text-sand-600">Pagamentos lançados conforme recebidos, despesas e fluxo de caixa</p>
      </div>

      <FinanceiroFiltros clientes={clientes.map((c) => ({ id: c.id, nome: c.nome }))} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm text-sand-600">A receber</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-brand-700">{formatBRL(aReceber)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-sand-600">Despesas totais</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-amber-700">{formatBRL(totalDespesas)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-sand-600">Saldo atual (recebido - despesas)</CardTitle></CardHeader>
          <CardContent className={`text-2xl font-bold ${saldoCaixa >= 0 ? "text-sage-700" : "text-red-700"}`}>
            {formatBRL(saldoCaixa)}
          </CardContent>
        </Card>
      </div>

      {comSaldoPendente.length > 0 && (
        <div className="rounded-full border border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-800">
          {comSaldoPendente.length} evento(s) com saldo em aberto.
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Eventos e saldo a receber</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratosComSaldo.map((c) => {
                const bloqueado = c.evento?.status === "concluido";
                const linhas = (
                  <>
                    <TableCell className="font-medium">
                      {c.evento?.nome || c.cliente.nome}
                      <span className="block text-xs font-normal text-sand-500">{c.cliente.nome}</span>
                    </TableCell>
                    <TableCell>{c.evento ? formatDate(c.evento.data) : "-"}</TableCell>
                    <TableCell>{formatBRL(c.total)}</TableCell>
                    <TableCell>{formatBRL(c.pago)}</TableCell>
                    <TableCell>
                      <Badge variant={c.saldo === 0 ? "success" : "warning"}>{formatBRL(c.saldo)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.saldo > 0 && !bloqueado ? (
                        <StopRowClick>
                          <RegistrarPagamentoDialog contratoId={c.id} clienteNome={c.cliente.nome} saldo={c.saldo} />
                        </StopRowClick>
                      ) : (
                        <span className="text-xs text-sand-500">{c.saldo === 0 ? "Quitado" : "Evento finalizado"}</span>
                      )}
                    </TableCell>
                  </>
                );
                return c.evento ? (
                  <ClickableRow key={c.id} href={`/eventos/${c.evento.id}`}>
                    {linhas}
                  </ClickableRow>
                ) : (
                  <TableRow key={c.id}>{linhas}</TableRow>
                );
              })}
              {contratosComSaldo.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-sand-500">
                    Nenhum evento encontrado com esses filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Margem de lucro por evento</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Despesas</TableHead>
                <TableHead>Lucro</TableHead>
                <TableHead>Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventos.map((e) => {
                const receita = Number(e.contrato.orcamento.total);
                const despesasEvento = e.despesas.reduce((acc, d) => acc + Number(d.valor), 0);
                const lucro = receita - despesasEvento;
                const margem = receita > 0 ? (lucro / receita) * 100 : 0;
                return (
                  <ClickableRow key={e.id} href={`/eventos/${e.id}`}>
                    <TableCell className="font-medium">
                      {e.nome || e.contrato.cliente.nome}
                      <span className="block text-xs font-normal text-sand-500">{e.contrato.cliente.nome}</span>
                    </TableCell>
                    <TableCell>{formatDate(e.data)}</TableCell>
                    <TableCell>{formatBRL(receita)}</TableCell>
                    <TableCell>{formatBRL(despesasEvento)}</TableCell>
                    <TableCell className={lucro >= 0 ? "text-sage-700" : "text-red-700"}>
                      {formatBRL(lucro)}
                    </TableCell>
                    <TableCell className={margem >= 0 ? "text-sage-700" : "text-red-700"}>
                      {margem.toFixed(1)}%
                    </TableCell>
                  </ClickableRow>
                );
              })}
              {eventos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-sand-500">
                    Nenhum evento encontrado com esses filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

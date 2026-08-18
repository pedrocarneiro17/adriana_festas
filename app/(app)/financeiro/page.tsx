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
  searchParams: Promise<{ cliente?: string; status?: string; de?: string; ate?: string; lancamentos?: string }>;
}) {
  const { cliente, status, de, ate, lancamentos } = await searchParams;
  const somenteAberto = lancamentos !== "todos";

  const periodoEvento: Prisma.DateTimeFilter = {};
  if (de) periodoEvento.gte = new Date(`${de}T00:00:00.000Z`);
  if (ate) periodoEvento.lte = new Date(`${ate}T23:59:59.999Z`);
  const temPeriodo = Boolean(de || ate);

  // Sem um status explícito, o padrão exclui contratos cancelados. Ao
  // escolher um status (inclusive "cancelado"), o filtro passa a valer
  // diretamente sobre o status do evento.
  const eventoWhere: Prisma.EventoWhereInput = {
    contrato: {
      ...(status ? {} : { status: { not: "cancelado" } }),
      ...(cliente ? { clienteId: cliente } : {}),
    },
    ...(status ? { status } : {}),
    ...(temPeriodo ? { data: periodoEvento } : {}),
  };

  const [eventos, clientes] = await Promise.all([
    prisma.evento.findMany({
      where: eventoWhere,
      include: {
        contrato: { include: { cliente: true, orcamento: true, pagamentos: true } },
        despesas: true,
      },
      orderBy: { data: "desc" },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const eventosComFinanceiro = eventos.map((e) => {
    const total = Number(e.contrato.valorMulta ?? e.contrato.orcamento.total);
    const pagoRegistrado = e.contrato.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
    // Os pagamentos registrados nunca são apagados (ficam intactos na página
    // do evento), mas o valor que efetivamente conta pro financeiro fica
    // limitado ao total (ex: multa de cancelamento menor que o já pago).
    const pago = Math.min(pagoRegistrado, total);
    const saldo = Math.max(0, total - pago);
    const despesasEvento = e.despesas.reduce((acc, d) => acc + Number(d.valor), 0);
    const lucro = total - despesasEvento;
    const margem = total > 0 ? (lucro / total) * 100 : 0;
    return { ...e, total, pago, saldo, despesasEvento, lucro, margem };
  });

  const comSaldoPendente = eventosComFinanceiro.filter((e) => e.saldo > 0);
  const listaExibida = somenteAberto ? comSaldoPendente : eventosComFinanceiro;

  const totalContratado = listaExibida.reduce((acc, e) => acc + e.total, 0);
  const totalRecebido = listaExibida.reduce((acc, e) => acc + e.pago, 0);
  const totalDespesas = listaExibida.reduce((acc, e) => acc + e.despesasEvento, 0);
  const aReceber = totalContratado - totalRecebido;
  const saldoCaixa = totalRecebido - totalDespesas;

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
        <CardHeader>
          <CardTitle>{somenteAberto ? "Eventos em aberto" : "Todos os lançamentos"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Despesas</TableHead>
                <TableHead>Lucro</TableHead>
                <TableHead>Margem</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listaExibida.map((e) => {
                const bloqueado = e.status === "concluido";
                return (
                  <ClickableRow key={e.id} href={`/eventos/${e.id}`}>
                    <TableCell className="font-medium">
                      {e.nome || e.contrato.cliente.nome}
                      <span className="block text-xs font-normal text-sand-500">{e.contrato.cliente.nome}</span>
                    </TableCell>
                    <TableCell>{formatDate(e.data)}</TableCell>
                    <TableCell>{formatBRL(e.total)}</TableCell>
                    <TableCell>{formatBRL(e.pago)}</TableCell>
                    <TableCell>
                      <Badge variant={e.saldo === 0 ? "success" : "warning"}>{formatBRL(e.saldo)}</Badge>
                    </TableCell>
                    <TableCell>{formatBRL(e.despesasEvento)}</TableCell>
                    <TableCell className={e.lucro >= 0 ? "text-sage-700" : "text-red-700"}>
                      {formatBRL(e.lucro)}
                    </TableCell>
                    <TableCell className={e.margem >= 0 ? "text-sage-700" : "text-red-700"}>
                      {e.margem.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {e.saldo > 0 && !bloqueado ? (
                        <StopRowClick>
                          <RegistrarPagamentoDialog contratoId={e.contrato.id} clienteNome={e.contrato.cliente.nome} saldo={e.saldo} />
                        </StopRowClick>
                      ) : (
                        <span className="text-xs text-sand-500">{e.saldo === 0 ? "Quitado" : "Evento finalizado"}</span>
                      )}
                    </TableCell>
                  </ClickableRow>
                );
              })}
              {listaExibida.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-6 text-center text-sand-500">
                    {somenteAberto
                      ? "Nenhum evento em aberto com esses filtros."
                      : "Nenhum evento encontrado com esses filtros."}
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

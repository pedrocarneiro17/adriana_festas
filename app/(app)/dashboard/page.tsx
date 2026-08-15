import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate, startOfToday, addDays } from "@/lib/utils";
import { AlertTriangle, CalendarClock, ListTodo, Wallet, Ban } from "lucide-react";

export default async function DashboardPage() {
  const hoje = startOfToday();
  const em30dias = addDays(hoje, 30);
  const tarefasDataInicio = addDays(hoje, -6);
  const tarefasDataFim = addDays(hoje, 2); // exclusive: cobre até amanhã

  const [contratos, eventosProximos, tarefasSoltas, datasBloqueadasProximas] = await Promise.all([
    prisma.contrato.findMany({
      where: { status: { not: "cancelado" } },
      include: { cliente: true, orcamento: true, evento: true, pagamentos: true },
    }),
    prisma.evento.findMany({
      where: { data: { gte: hoje, lte: em30dias }, status: { not: "cancelado" } },
      include: { contrato: { include: { cliente: true } } },
      orderBy: { data: "asc" },
    }),
    prisma.tarefa.findMany({
      where: { eventoId: null, data: { gte: tarefasDataInicio, lt: tarefasDataFim } },
      include: { itens: true },
      orderBy: { data: "asc" },
    }),
    prisma.dataBloqueada.findMany({
      where: {
        data: { lte: em30dias },
        OR: [{ dataFim: { gte: hoje } }, { dataFim: null, data: { gte: hoje } }],
      },
      orderBy: { data: "asc" },
    }),
  ]);

  const tarefasComPendencias = tarefasSoltas
    .map((t) => ({ ...t, pendentes: t.itens.filter((i) => !i.concluido) }))
    .filter((t) => t.pendentes.length > 0);

  const comSaldoPendente = contratos
    .map((c) => {
      const total = Number(c.orcamento.total);
      const pago = c.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
      return { ...c, saldo: Math.max(0, total - pago) };
    })
    .filter((c) => c.saldo > 0)
    .sort((a, b) => (a.evento && b.evento ? a.evento.data.getTime() - b.evento.data.getTime() : 0));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Painel</h1>
        <p className="text-sm text-sand-600">Resumo do dia a dia da Adriana Festas</p>
      </div>

      {tarefasComPendencias.length > 0 && (
        <Card className="border border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" strokeWidth={2.75} /> Tarefas soltas em aberto
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-amber-800">
            {tarefasComPendencias.map((t) => (
              <div key={t.id}>
                <strong>{t.titulo}</strong> ({formatDate(t.data)}): {t.pendentes.map((p) => p.descricao).join(", ")}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {datasBloqueadasProximas.length > 0 && (
        <Card className="border border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Ban className="h-4 w-4" strokeWidth={2.75} /> Datas bloqueadas se aproximando
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-red-800">
            {datasBloqueadasProximas.map((d) => (
              <div key={d.id}>
                {formatDate(d.data)}
                {d.dataFim && ` até ${formatDate(d.dataFim)}`}
                {d.motivo && ` · ${d.motivo}`}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-brand-600" strokeWidth={2.75} /> Eventos com saldo em aberto
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {comSaldoPendente
            .filter((c) => c.evento)
            .map((c) => (
              <Link
                key={c.id}
                href={`/eventos/${c.evento!.id}`}
                className="flex items-center justify-between rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm hover:bg-amber-100"
              >
                <span>{c.cliente.nome} · evento em {formatDate(c.evento!.data)}</span>
                <Badge variant="warning">{formatBRL(c.saldo)}</Badge>
              </Link>
            ))}
          {comSaldoPendente.length === 0 && <p className="text-sm text-sand-500">Todos os eventos estão quitados.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-brand-600" strokeWidth={2.75} /> Eventos se aproximando (30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {eventosProximos.map((e) => (
            <Link
              key={e.id}
              href={`/eventos/${e.id}`}
              className="flex items-center justify-between rounded-full border border-[var(--color-divider)] px-4 py-2 text-sm hover:bg-sand-100"
            >
              <span>{e.contrato.cliente.nome}</span>
              <span className="flex items-center gap-2 text-sand-600">
                {formatDate(e.data)} {e.horario && `· ${e.horario}`}
              </span>
            </Link>
          ))}
          {eventosProximos.length === 0 && <p className="text-sm text-sand-500">Nenhum evento nos próximos 30 dias.</p>}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm text-sand-600">
        <ListTodo className="h-4 w-4" strokeWidth={2.75} />
        <Link href="/agenda" className="hover:underline">
          Ver tarefas soltas na agenda
        </Link>
      </div>
    </div>
  );
}

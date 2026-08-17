import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate, startOfToday, addDays } from "@/lib/utils";
import { AlertTriangle, CalendarClock, ListTodo, Ban } from "lucide-react";

export default async function DashboardPage() {
  const hoje = startOfToday();
  const em30dias = addDays(hoje, 30);
  const tarefasDataInicio = addDays(hoje, -6);
  const tarefasDataFim = addDays(hoje, 2); // exclusive: cobre até amanhã

  const [eventosProximos, tarefasSoltas, datasBloqueadasProximas] = await Promise.all([
    prisma.evento.findMany({
      where: { data: { gte: hoje }, status: { not: "cancelado" } },
      include: { contrato: { include: { cliente: true, orcamento: true, pagamentos: true } } },
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

  const eventosComSaldo = eventosProximos.map((e) => {
    const total = Number(e.contrato.orcamento.total);
    const pago = e.contrato.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
    return { ...e, saldo: Math.max(0, total - pago) };
  });

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
            <CalendarClock className="h-4 w-4 text-brand-600" strokeWidth={2.75} /> Eventos se aproximando
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {eventosComSaldo.map((e) => (
            <Link
              key={e.id}
              href={`/eventos/${e.id}`}
              className="flex items-center justify-between gap-3 rounded-full border border-[var(--color-divider)] px-4 py-2 text-sm hover:bg-sand-100"
            >
              <span>
                {e.nome || e.contrato.cliente.nome}
                {e.nome && <span className="block text-xs text-sand-500">{e.contrato.cliente.nome}</span>}
              </span>
              <span className="flex items-center gap-3 text-sand-600">
                <span>{formatDate(e.data)} {e.horario && `· ${e.horario}`}</span>
                <Badge variant={e.saldo > 0 ? "warning" : "success"} className="shrink-0">
                  {e.saldo > 0 ? formatBRL(e.saldo) : "Quitado"}
                </Badge>
              </span>
            </Link>
          ))}
          {eventosComSaldo.length === 0 && <p className="text-sm text-sand-500">Nenhum evento agendado.</p>}
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

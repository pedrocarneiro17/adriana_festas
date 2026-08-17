import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import EventoRow from "./evento-row";
import MonthGrid from "./month-grid";
import AgendaLayout from "./agenda-layout";
import TarefaCard from "./tarefa-card";
import BloqueioRow from "./bloqueio-row";

function parseMes(mesParam?: string) {
  if (mesParam && /^\d{4}-\d{2}$/.test(mesParam)) {
    const [ano, mes] = mesParam.split("-").map(Number);
    return { ano, mes };
  }
  const now = new Date();
  return { ano: now.getFullYear(), mes: now.getMonth() + 1 };
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes: mesParam } = await searchParams;
  const { ano, mes } = parseMes(mesParam);

  const inicioMes = new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 0, 23, 59, 59));

  const mesAnteriorDate = new Date(Date.UTC(ano, mes - 2, 1));
  const mesSeguinteDate = new Date(Date.UTC(ano, mes, 1));
  const mesAnterior = `${mesAnteriorDate.getUTCFullYear()}-${String(mesAnteriorDate.getUTCMonth() + 1).padStart(2, "0")}`;
  const mesSeguinte = `${mesSeguinteDate.getUTCFullYear()}-${String(mesSeguinteDate.getUTCMonth() + 1).padStart(2, "0")}`;

  const [eventos, tarefas, datasBloqueadas, eventosParaAssociar] = await Promise.all([
    prisma.evento.findMany({
      where: { data: { gte: inicioMes, lte: fimMes } },
      include: { contrato: { include: { cliente: true } } },
      orderBy: { data: "asc" },
    }),
    prisma.tarefa.findMany({
      where: { data: { gte: inicioMes, lte: fimMes } },
      include: { itens: true, evento: { include: { contrato: { include: { cliente: true } } } } },
      orderBy: { data: "asc" },
    }),
    prisma.dataBloqueada.findMany({
      where: {
        data: { lte: fimMes },
        OR: [{ dataFim: { gte: inicioMes } }, { dataFim: null, data: { gte: inicioMes } }],
      },
      orderBy: { data: "asc" },
    }),
    prisma.evento.findMany({
      where: { status: { not: "cancelado" } },
      include: { contrato: { include: { cliente: true } } },
      orderBy: { data: "asc" },
    }),
  ]);

  const eventosOptions = eventosParaAssociar.map((e) => ({
    id: e.id,
    label: `${e.nome || e.contrato.cliente.nome} · ${formatDate(e.data)}`,
  }));

  const nomeMes = inicioMes.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

  type ItemAgenda =
    | { tipo: "evento"; data: Date; node: React.ReactNode }
    | { tipo: "tarefa"; data: Date; node: React.ReactNode }
    | { tipo: "bloqueio"; data: Date; node: React.ReactNode };

  const itens: ItemAgenda[] = [
    ...eventos.map((e): ItemAgenda => ({
      tipo: "evento",
      data: e.data,
      node: (
        <EventoRow
          key={`evento-${e.id}`}
          evento={{
            id: e.id,
            data: e.data.toISOString(),
            horario: e.horario,
            local: e.local,
            status: e.status,
            cliente: e.contrato.cliente.nome,
            contratoId: e.contrato.id,
          }}
        />
      ),
    })),
    ...tarefas.map((t): ItemAgenda => ({
      tipo: "tarefa",
      data: t.data,
      node: (
        <TarefaCard
          key={`tarefa-${t.id}`}
          tarefa={{ ...t, data: t.data.toISOString() }}
          eventoAtual={t.evento ? { id: t.evento.id, nome: t.evento.nome || t.evento.contrato.cliente.nome } : null}
          eventosOptions={eventosOptions}
        />
      ),
    })),
    ...datasBloqueadas.map((d): ItemAgenda => ({
      tipo: "bloqueio",
      data: d.data,
      node: (
        <BloqueioRow
          key={`bloqueio-${d.id}`}
          bloqueio={{ id: d.id, data: d.data.toISOString(), dataFim: d.dataFim?.toISOString() ?? null, motivo: d.motivo }}
        />
      ),
    })),
  ].sort((a, b) => a.data.getTime() - b.data.getTime());

  const lista = (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">Agenda de {nomeMes}</CardTitle>
          <Button asChild size="sm">
            <Link href="/agenda/novo">
              <Plus className="h-4 w-4" /> Novo
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {itens.map((item) => item.node)}
        {itens.length === 0 && <p className="text-sm text-sand-500">Nada na agenda neste mês.</p>}
      </CardContent>
    </Card>
  );

  const calendario = (
    <MonthGrid
      ano={ano}
      mes={mes}
      eventos={eventos.map((e) => ({
        id: e.id,
        data: e.data.toISOString(),
        cliente: e.contrato.cliente.nome,
        horario: e.horario,
        local: e.local,
      }))}
      tarefas={tarefas.map((t) => ({
        id: t.id,
        data: t.data.toISOString(),
        titulo: t.titulo,
        itens: t.itens.map((i) => ({ id: i.id, descricao: i.descricao, concluido: i.concluido })),
      }))}
      datasBloqueadas={datasBloqueadas.map((d) => ({
        id: d.id,
        data: d.data.toISOString(),
        dataFim: d.dataFim?.toISOString() ?? null,
        motivo: d.motivo,
      }))}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-sm capitalize text-sand-600">{nomeMes}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/agenda?mes=${mesAnterior}`} className="rounded-full border border-[var(--color-divider)] p-2 hover:bg-sand-100">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link href={`/agenda?mes=${mesSeguinte}`} className="rounded-full border border-[var(--color-divider)] p-2 hover:bg-sand-100">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <AgendaLayout lista={lista} calendario={calendario} />
    </div>
  );
}

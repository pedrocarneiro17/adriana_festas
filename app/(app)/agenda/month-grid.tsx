"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, PartyPopper, ListChecks, Ban } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { alternarItemTarefa } from "@/lib/actions/tarefas";
import { removerDataBloqueada } from "@/lib/actions/agenda";

type Evento = { id: string; data: string; cliente: string; horario: string | null; local: string | null };
type Tarefa = {
  id: string;
  data: string;
  titulo: string;
  itens: { id: string; descricao: string; concluido: boolean }[];
};
type DataBloqueada = { id: string; data: string; dataFim: string | null; motivo: string | null };

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function MonthGrid({
  ano,
  mes,
  eventos,
  tarefas = [],
  datasBloqueadas,
}: {
  ano: number;
  mes: number;
  eventos: Evento[];
  tarefas?: Tarefa[];
  datasBloqueadas: DataBloqueada[];
}) {
  const [abertoDia, setAbertoDia] = useState<number | null>(null);

  const primeiroDia = new Date(Date.UTC(ano, mes - 1, 1));
  const totalDias = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const offset = primeiroDia.getUTCDay();

  const eventosPorDia = new Map<number, Evento[]>();
  for (const e of eventos) {
    const dia = new Date(e.data).getUTCDate();
    eventosPorDia.set(dia, [...(eventosPorDia.get(dia) ?? []), e]);
  }

  const tarefasPorDia = new Map<number, Tarefa[]>();
  for (const t of tarefas) {
    const dia = new Date(t.data).getUTCDate();
    tarefasPorDia.set(dia, [...(tarefasPorDia.get(dia) ?? []), t]);
  }

  const bloqueadasPorDia = new Map<number, DataBloqueada>();
  for (const d of datasBloqueadas) {
    const inicio = new Date(d.data);
    const fim = d.dataFim ? new Date(d.dataFim) : inicio;
    const cursor = new Date(inicio);
    while (cursor.getTime() <= fim.getTime()) {
      if (cursor.getUTCMonth() === mes - 1 && cursor.getUTCFullYear() === ano) {
        bloqueadasPorDia.set(cursor.getUTCDate(), d);
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  const celulas: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-[28px] bg-[var(--color-surface)] p-3">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-sand-600">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {celulas.map((dia, idx) => {
          if (!dia) return <div key={idx} className="h-20 rounded-md" />;
          const bloqueada = bloqueadasPorDia.get(dia);
          const eventosDia = eventosPorDia.get(dia) ?? [];
          const tarefasDia = tarefasPorDia.get(dia) ?? [];
          const totalItens = eventosDia.length + tarefasDia.length + (bloqueada ? 1 : 0);
          const aberto = abertoDia === dia;
          const colIndex = idx % 7;
          const alinhaDireita = colIndex >= 4;

          return (
            <div key={idx} className="group relative">
              <button
                type="button"
                onClick={() => setAbertoDia(aberto ? null : dia)}
                className={cn(
                  "flex h-20 w-full flex-col gap-0.5 overflow-hidden rounded-md border p-1 text-left text-xs",
                  bloqueada ? "border-red-200 bg-red-50" : "border-[var(--color-divider)]",
                  totalItens > 0 && "cursor-pointer hover:brightness-95"
                )}
              >
                <span className={cn("font-medium", bloqueada && "text-red-700")}>{dia}</span>
                {bloqueada && <span className="truncate text-[10px] text-red-600">Fechado</span>}
                {eventosDia.slice(0, 2).map((e) => (
                  <span key={e.id} className="truncate rounded bg-brand-100 px-1 text-[10px] text-brand-700">
                    {e.cliente}
                  </span>
                ))}
                {eventosDia.length < 2 &&
                  tarefasDia.slice(0, 2 - eventosDia.length).map((t) => (
                    <span key={t.id} className="truncate rounded bg-sage-100 px-1 text-[10px] text-sage-800">
                      {t.titulo}
                    </span>
                  ))}
              </button>

              {totalItens > 0 && (
                <div
                  className={cn(
                    "invisible absolute top-full z-50 mt-1 w-64 max-w-[80vw] flex-col gap-2 rounded-2xl border border-[var(--color-divider)] bg-[var(--color-bg)] p-3 opacity-0 shadow-[var(--shadow-lg)] transition-opacity group-hover:visible group-hover:opacity-100",
                    alinhaDireita ? "right-0" : "left-0",
                    aberto && "visible opacity-100",
                    "flex"
                  )}
                >
                  <span className="text-xs font-semibold text-sand-600">{formatDate(new Date(Date.UTC(ano, mes - 1, dia)))}</span>

                  {bloqueada && (
                    <div className="flex items-start justify-between gap-2 rounded-xl bg-red-50 p-2 text-xs text-red-800">
                      <div className="flex items-center gap-1.5">
                        <Ban className="h-3.5 w-3.5 shrink-0" strokeWidth={2.75} />
                        <span>{bloqueada.motivo || "Data fechada"}</span>
                      </div>
                      <BloqueioRemoveButton id={bloqueada.id} />
                    </div>
                  )}

                  {eventosDia.map((e) => (
                    <Link
                      key={e.id}
                      href={`/eventos/${e.id}`}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-100 p-2 text-xs text-brand-800 hover:bg-brand-200"
                    >
                      <PartyPopper className="h-3.5 w-3.5 shrink-0" strokeWidth={2.75} />
                      <span>
                        {e.cliente} {e.horario && `· ${e.horario}`} {e.local && `· ${e.local}`}
                      </span>
                    </Link>
                  ))}

                  {tarefasDia.map((t) => (
                    <div key={t.id} className="rounded-xl bg-sage-100 p-2 text-xs text-sage-800">
                      <div className="mb-1 flex items-center gap-1.5 font-medium">
                        <ListChecks className="h-3.5 w-3.5 shrink-0" strokeWidth={2.75} />
                        {t.titulo}
                      </div>
                      <div className="flex flex-col gap-1 pl-1">
                        {t.itens.map((item) => (
                          <TarefaItemCheck key={item.id} item={item} />
                        ))}
                        {t.itens.length === 0 && <span className="text-sage-600">Sem itens no checklist.</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TarefaItemCheck({ item }: { item: { id: string; descricao: string; concluido: boolean } }) {
  const [isPending, startTransition] = useTransition();
  return (
    <label className="flex items-center gap-1.5">
      <Checkbox
        checked={item.concluido}
        disabled={isPending}
        onCheckedChange={(checked) => startTransition(() => alternarItemTarefa(item.id, checked === true))}
      />
      <span className={item.concluido ? "text-sage-500 line-through" : ""}>{item.descricao}</span>
    </label>
  );
}

function BloqueioRemoveButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-5 w-5 shrink-0"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        startTransition(() => removerDataBloqueada(id));
      }}
    >
      <Trash2 className="h-3.5 w-3.5 text-red-600" />
    </Button>
  );
}

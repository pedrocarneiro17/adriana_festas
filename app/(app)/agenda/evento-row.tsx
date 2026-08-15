"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, toDateInputValue } from "@/lib/utils";
import { moverEvento, atualizarStatusEvento, verificarConflitosData } from "@/lib/actions/agenda";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  agendado: "default",
  em_execucao: "warning",
  concluido: "success",
  cancelado: "destructive",
};

type Evento = {
  id: string;
  data: string;
  horario: string | null;
  local: string | null;
  status: string;
  cliente: string;
  contratoId: string;
};

export default function EventoRow({ evento }: { evento: Evento }) {
  const [isPending, startTransition] = useTransition();
  const [editando, setEditando] = useState(false);
  const [novaData, setNovaData] = useState(toDateInputValue(evento.data));
  const readOnly = evento.status === "concluido";

  async function salvarNovaData() {
    const { eventosConflitantes, dataBloqueada } = await verificarConflitosData(novaData, evento.id);
    if (dataBloqueada) {
      if (!window.confirm(`Esta data está marcada como fechada (${dataBloqueada.motivo || "sem motivo"}). Continuar mesmo assim?`)) return;
    }
    if (eventosConflitantes.length > 0) {
      if (!window.confirm(`Já existe(m) ${eventosConflitantes.length} evento(s) nesta data. Continuar mesmo assim?`)) return;
    }
    startTransition(async () => {
      await moverEvento(evento.id, novaData);
      setEditando(false);
    });
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 rounded-2xl border border-[var(--color-divider)] p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col">
        <Link href={`/eventos/${evento.id}`} className="font-medium text-brand-700 hover:underline">
          {evento.cliente}
        </Link>
        <span className="text-sand-600">
          {formatDate(evento.data)} {evento.horario ? `· ${evento.horario}` : ""} {evento.local ? `· ${evento.local}` : ""}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {editando ? (
          <>
            <Input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} className="h-8 w-36" />
            <Button size="sm" disabled={isPending} onClick={salvarNovaData}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Select
              value={evento.status}
              disabled={readOnly}
              onValueChange={(v) => startTransition(() => atualizarStatusEvento(evento.id, v as "agendado" | "em_execucao" | "concluido" | "cancelado"))}
            >
              <SelectTrigger className="h-8 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="em_execucao">Em execução</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            {!readOnly && (
              <Button size="sm" variant="outline" onClick={() => setEditando(true)}>
                Mover data
              </Button>
            )}
          </>
        )}
        <Badge variant={statusVariant[evento.status]}>{evento.status.replace("_", " ")}</Badge>
      </div>
    </div>
  );
}

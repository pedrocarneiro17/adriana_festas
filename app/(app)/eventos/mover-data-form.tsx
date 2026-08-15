"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toDateInputValue } from "@/lib/utils";
import { moverEvento, verificarConflitosData } from "@/lib/actions/agenda";

export default function MoverDataForm({ eventoId, data }: { eventoId: string; data: string }) {
  const [isPending, startTransition] = useTransition();
  const [editando, setEditando] = useState(false);
  const [novaData, setNovaData] = useState(toDateInputValue(data));

  async function salvar() {
    const { eventosConflitantes, dataBloqueada } = await verificarConflitosData(novaData, eventoId);
    if (dataBloqueada) {
      if (!window.confirm(`Esta data está marcada como fechada (${dataBloqueada.motivo || "sem motivo"}). Continuar mesmo assim?`)) return;
    }
    if (eventosConflitantes.length > 0) {
      if (!window.confirm(`Já existe(m) ${eventosConflitantes.length} evento(s) nesta data. Continuar mesmo assim?`)) return;
    }
    startTransition(async () => {
      await moverEvento(eventoId, novaData);
      setEditando(false);
    });
  }

  if (!editando) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
        Mover data
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} className="h-8 w-40" />
      <Button size="sm" disabled={isPending} onClick={salvar}>
        Salvar
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setEditando(false)}>
        Cancelar
      </Button>
    </div>
  );
}

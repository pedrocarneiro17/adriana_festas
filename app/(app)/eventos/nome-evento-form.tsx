"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { atualizarNomeEvento } from "@/lib/actions/agenda";

export default function NomeEventoForm({
  eventoId,
  nome,
  readOnly,
}: {
  eventoId: string;
  nome: string | null;
  readOnly?: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(nome ?? "");
  const [isPending, startTransition] = useTransition();

  if (editando) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="h-8 w-64 text-lg font-[family-name:var(--font-heading)]"
          autoFocus
        />
        <Button
          size="icon"
          variant="ghost"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await atualizarNomeEvento(eventoId, valor);
              setEditando(false);
            })
          }
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setEditando(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold">{nome || "Evento sem nome"}</h1>
      {!readOnly && (
        <Button size="icon" variant="ghost" onClick={() => setEditando(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

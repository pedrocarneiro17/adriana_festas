"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { atualizarStatusEvento } from "@/lib/actions/agenda";
import { cancelarContrato } from "@/lib/actions/contratos";

export default function EventoAcoes({
  eventoId,
  contratoId,
  status,
}: {
  eventoId: string;
  contratoId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (status === "concluido") {
    return (
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => atualizarStatusEvento(eventoId, "em_execucao"))}
      >
        <RotateCcw className="h-4 w-4" /> Reabrir evento
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        disabled={isPending}
        onClick={() => {
          if (window.confirm("Finalizar este evento? Depois de finalizado, os registros ficam bloqueados para edição (é possível reabrir depois).")) {
            startTransition(() => atualizarStatusEvento(eventoId, "concluido"));
          }
        }}
      >
        <CheckCircle2 className="h-4 w-4" /> Finalizar evento
      </Button>
      {status !== "cancelado" && (
        <Button
          variant="destructive"
          disabled={isPending}
          onClick={() => {
            if (window.confirm("Cancelar este evento e o contrato vinculado?")) {
              startTransition(() => cancelarContrato(contratoId));
            }
          }}
        >
          Cancelar
        </Button>
      )}
    </div>
  );
}

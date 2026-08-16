"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { mudarStatusOrcamento } from "@/lib/actions/orcamentos";

export default function OrcamentoStatusActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  function mudar(novo: "enviado" | "recusado") {
    startTransition(() => mudarStatusOrcamento(id, novo));
  }

  return (
    <div className="flex gap-2">
      {status !== "enviado" && (
        <Button variant="outline" disabled={isPending} onClick={() => mudar("enviado")}>
          Marcar como enviado
        </Button>
      )}
      {status !== "recusado" && (
        <Button variant="outline" disabled={isPending} onClick={() => mudar("recusado")}>
          Marcar como recusado
        </Button>
      )}
    </div>
  );
}

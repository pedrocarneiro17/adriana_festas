"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { atualizarCondicoesPagamento } from "@/lib/actions/contratos";

export default function CondicoesPagamentoForm({
  id,
  condicoesPagamento,
  readOnly,
}: {
  id: string;
  condicoesPagamento: string;
  readOnly?: boolean;
}) {
  const [value, setValue] = useState(condicoesPagamento);
  const [isPending, startTransition] = useTransition();

  if (readOnly) {
    return <p className="text-sm text-sand-700">{condicoesPagamento || "-"}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} />
      <Button
        size="sm"
        variant="outline"
        className="w-fit"
        disabled={isPending}
        onClick={() => startTransition(() => atualizarCondicoesPagamento(id, value))}
      >
        {isPending ? "Salvando..." : "Salvar condições"}
      </Button>
    </div>
  );
}

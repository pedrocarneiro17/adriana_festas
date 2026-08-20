"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { atualizarSomenteDecoracao } from "@/lib/actions/contratos";

export default function SomenteDecoracaoToggle({
  id,
  somenteDecoracao,
  readOnly,
}: {
  id: string;
  somenteDecoracao: boolean;
  readOnly?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={`somente-decoracao-${id}`}
        checked={somenteDecoracao}
        disabled={isPending || readOnly}
        onCheckedChange={(checked) => startTransition(() => atualizarSomenteDecoracao(id, checked === true))}
      />
      <Label htmlFor={`somente-decoracao-${id}`}>Somente decoração (contrato sem &quot;e cerimonial&quot;)</Label>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { assinarContrato } from "@/lib/actions/contratos";

export default function AssinaturaToggle({
  id,
  assinado,
  readOnly,
}: {
  id: string;
  assinado: boolean;
  readOnly?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={`assinado-${id}`}
        checked={assinado}
        disabled={isPending || readOnly}
        onCheckedChange={(checked) => startTransition(() => assinarContrato(id, checked === true))}
      />
      <Label htmlFor={`assinado-${id}`}>Contrato assinado / impresso</Label>
    </div>
  );
}

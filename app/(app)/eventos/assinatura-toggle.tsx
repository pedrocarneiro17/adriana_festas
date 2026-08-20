"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { toDateInputValue } from "@/lib/utils";
import { assinarContrato, atualizarDataAssinatura } from "@/lib/actions/contratos";

export default function AssinaturaToggle({
  id,
  assinado,
  dataAssinatura,
  readOnly,
}: {
  id: string;
  assinado: boolean;
  dataAssinatura: Date | string | null;
  readOnly?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`assinado-${id}`}
          checked={assinado}
          disabled={isPending || readOnly}
          onCheckedChange={(checked) => startTransition(() => assinarContrato(id, checked === true))}
        />
        <Label htmlFor={`assinado-${id}`}>Contrato assinado</Label>
      </div>
      {assinado && (
        <div className="flex items-center gap-2 pl-6">
          <Label className="text-sm text-sand-600 font-normal">Data:</Label>
          <DatePicker
            value={toDateInputValue(dataAssinatura)}
            disabled={isPending || readOnly}
            onChange={(value) => startTransition(() => atualizarDataAssinatura(id, value))}
          />
        </div>
      )}
    </div>
  );
}

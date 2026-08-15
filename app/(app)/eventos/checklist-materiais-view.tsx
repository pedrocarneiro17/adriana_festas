"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { alternarChecklistMaterial } from "@/lib/actions/tarefas";

type Item = { id: string; materialNome: string; quantidadeTotalNecessaria: unknown; unidade: string; tenho: boolean };

export default function ChecklistMateriaisView({ itens, readOnly }: { itens: Item[]; readOnly?: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-1">
      {itens.map((item) => (
        <label
          key={item.id}
          className="flex items-center justify-between rounded-md border border-[var(--color-divider)] p-2 text-sm"
        >
          <span className="flex items-center gap-2">
            <Checkbox
              checked={item.tenho}
              disabled={isPending || readOnly}
              onCheckedChange={(checked) => startTransition(() => alternarChecklistMaterial(item.id, checked === true))}
            />
            <span className="capitalize">{item.materialNome}</span>
          </span>
          <span className="text-sand-600">
            {String(item.quantidadeTotalNecessaria)} {item.unidade}
          </span>
        </label>
      ))}
    </div>
  );
}

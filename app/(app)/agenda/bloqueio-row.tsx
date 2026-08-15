"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Ban } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { removerDataBloqueada } from "@/lib/actions/agenda";

export default function BloqueioRow({
  bloqueio,
}: {
  bloqueio: { id: string; data: string; dataFim: string | null; motivo: string | null };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-red-800">
        <Ban className="h-4 w-4 shrink-0" strokeWidth={2.75} />
        <span>
          Data fechada · {formatDate(bloqueio.data)}
          {bloqueio.dataFim && ` até ${formatDate(bloqueio.dataFim)}`}
          {bloqueio.motivo && ` · ${bloqueio.motivo}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="destructive">bloqueado</Badge>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={() => startTransition(() => removerDataBloqueada(bloqueio.id))}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

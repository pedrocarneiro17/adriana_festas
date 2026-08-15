"use client";

import { useTransition } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/utils";
import { excluirDespesa } from "@/lib/actions/financeiro";

export default function DespesaEventoRow({
  despesa,
  readOnly,
}: {
  despesa: { id: string; descricao: string; valor: string; data: string };
  readOnly?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <TableRow>
      <TableCell>{despesa.descricao}</TableCell>
      <TableCell>{formatDate(despesa.data)}</TableCell>
      <TableCell>{formatBRL(despesa.valor)}</TableCell>
      <TableCell className="text-right">
        {!readOnly && (
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={() => startTransition(() => excluirDespesa(despesa.id))}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

"use client";

import { useTransition } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/utils";
import { excluirDespesa } from "@/lib/actions/financeiro";

type Despesa = {
  id: string;
  descricao: string;
  valor: string;
  data: string;
  eventoLabel: string;
};

export default function DespesaRow({ despesa }: { despesa: Despesa }) {
  const [isPending, startTransition] = useTransition();

  return (
    <TableRow>
      <TableCell>{despesa.descricao}</TableCell>
      <TableCell>{despesa.eventoLabel}</TableCell>
      <TableCell>{formatDate(despesa.data)}</TableCell>
      <TableCell>{formatBRL(despesa.valor)}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={() => startTransition(() => excluirDespesa(despesa.id))}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

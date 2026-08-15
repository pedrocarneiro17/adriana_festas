"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { excluirPagamento } from "@/lib/actions/financeiro";

export default function ExcluirPagamentoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={() => {
        if (window.confirm("Excluir este pagamento?")) startTransition(() => excluirPagamento(id));
      }}
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}

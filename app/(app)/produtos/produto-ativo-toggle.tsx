"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";
import { alternarAtivoProduto } from "@/lib/actions/produtos";

export default function ProdutoAtivoToggle({ id, ativo }: { id: string; ativo: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={isPending}
      title={ativo ? "Inativar produto" : "Reativar produto"}
      onClick={() => startTransition(() => alternarAtivoProduto(id, !ativo))}
    >
      <Power className={`h-4 w-4 ${ativo ? "text-green-600" : "text-sand-500"}`} />
    </Button>
  );
}

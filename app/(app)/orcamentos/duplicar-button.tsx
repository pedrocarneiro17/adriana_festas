"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { duplicarOrcamento } from "@/lib/actions/orcamentos";

export default function DuplicarButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => duplicarOrcamento(id))}
    >
      <Copy className="h-4 w-4" /> Duplicar
    </Button>
  );
}

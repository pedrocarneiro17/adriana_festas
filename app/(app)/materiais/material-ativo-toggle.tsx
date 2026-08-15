"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";
import { alternarAtivoMaterial } from "@/lib/actions/materiais";

export default function MaterialAtivoToggle({ id, ativo }: { id: string; ativo: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={isPending}
      title={ativo ? "Inativar material" : "Reativar material"}
      onClick={() => startTransition(() => alternarAtivoMaterial(id, !ativo))}
    >
      <Power className={`h-4 w-4 ${ativo ? "text-sage-600" : "text-sand-500"}`} />
    </Button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default function ReajustarButton({
  orcamentoId,
  label,
  contratoAssinado,
}: {
  orcamentoId: string;
  label: string;
  contratoAssinado: boolean;
}) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (
          contratoAssinado &&
          !window.confirm(
            "Este orçamento já é um contrato assinado. Deseja realmente abri-lo para edição? " +
              "Qualquer alteração vai gerar uma nova versão do orçamento e um novo contrato."
          )
        ) {
          return;
        }
        router.push(`/orcamentos/${orcamentoId}/editar`);
      }}
    >
      <Pencil className="h-4 w-4" /> {label}
    </Button>
  );
}

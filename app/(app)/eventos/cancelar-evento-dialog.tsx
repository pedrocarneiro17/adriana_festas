"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cancelarContrato } from "@/lib/actions/contratos";

export default function CancelarEventoDialog({ contratoId }: { contratoId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [cobrarMulta, setCobrarMulta] = useState(false);
  const [multa, setMulta] = useState(0);
  const [motivo, setMotivo] = useState("");

  function handleConfirm() {
    startTransition(async () => {
      await cancelarContrato(contratoId, cobrarMulta ? multa : undefined, motivo || undefined);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Cancelar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar evento</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-sand-600">
            O evento e o contrato vinculado serão marcados como cancelados. Se houver multa
            contratual, o total do orçamento passa a valer só o valor da multa, e saldo/pagamento
            do evento já refletem isso.
          </p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cobrarMulta}
              onChange={(e) => setCobrarMulta(e.target.checked)}
              className="h-4 w-4"
            />
            Cobrar multa contratual
          </label>
          {cobrarMulta && (
            <div className="flex flex-col gap-1.5">
              <Label>Valor da multa</Label>
              <CurrencyInput value={multa} onValueChange={setMulta} />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label>Motivo (opcional)</Label>
            <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: cliente desistiu, remarcação..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
            Voltar
          </Button>
          <Button variant="destructive" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

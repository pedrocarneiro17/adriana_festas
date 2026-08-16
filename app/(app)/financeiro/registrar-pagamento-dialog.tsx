"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { registrarPagamento } from "@/lib/actions/financeiro";
import { toDateInputValue } from "@/lib/utils";

export default function RegistrarPagamentoDialog({
  contratoId,
  clienteNome,
  saldo,
}: {
  contratoId: string;
  clienteNome: string;
  saldo: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [valor, setValor] = useState(saldo > 0 ? saldo : 0);
  const [data, setData] = useState(toDateInputValue(new Date()));
  const [formaPagamento, setFormaPagamento] = useState("Pix");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await registrarPagamento(contratoId, { valor, data, formaPagamento });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Registrar pagamento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-sand-600">
          {clienteNome} · saldo em aberto: {saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Valor recebido</Label>
            <CurrencyInput value={valor} onValueChange={setValor} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Data do pagamento</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Forma de pagamento</Label>
            <Input value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

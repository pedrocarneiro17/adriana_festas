"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { aprovarOrcamento } from "@/lib/actions/orcamentos";
import { verificarDataBloqueada } from "@/lib/actions/agenda";

export default function AprovarOrcamentoDialog({
  orcamentoId,
  validadeAte,
}: {
  orcamentoId: string;
  validadeAte: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [nome, setNome] = useState("");
  const [dataEvento, setDataEvento] = useState(validadeAte ?? "");
  const [horario, setHorario] = useState("");
  const [local, setLocal] = useState("");
  const [condicoesPagamento, setCondicoesPagamento] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const bloqueada = await verificarDataBloqueada(dataEvento);
    if (bloqueada) {
      const continuar = window.confirm(
        `Esta data está marcada como fechada (${bloqueada.motivo || "sem motivo"}). Deseja continuar mesmo assim?`
      );
      if (!continuar) return;
    }

    startTransition(() =>
      aprovarOrcamento(orcamentoId, {
        nome,
        dataEvento,
        horario,
        local,
        condicoesPagamento: condicoesPagamento || undefined,
      })
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CheckCircle2 className="h-4 w-4" /> Aprovar orçamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprovar orçamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-sm text-sand-600">
            Ao aprovar, o contrato e o evento na agenda são criados automaticamente. Os pagamentos são
            lançados depois, na área financeira, conforme forem recebidos.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label>Nome do evento</Label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Aniversário de 15 anos" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Data do evento</Label>
              <Input type="date" required value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Horário</Label>
              <Input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Local</Label>
            <Input value={local} onChange={(e) => setLocal(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Condições de pagamento (opcional)</Label>
            <Textarea value={condicoesPagamento} onChange={(e) => setCondicoesPagamento(e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Aprovando..." : "Confirmar aprovação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

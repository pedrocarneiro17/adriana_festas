"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
import { Plus, Trash2 } from "lucide-react";
import { criarTarefa } from "@/lib/actions/tarefas";
import { toDateInputValue } from "@/lib/utils";

export default function NovaTarefaDialog({ eventoId }: { eventoId?: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState(toDateInputValue(new Date()));
  const [itens, setItens] = useState<string[]>([""]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await criarTarefa({ titulo, data, eventoId: eventoId ?? null, itens });
      setTitulo("");
      setItens([""]);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Nova tarefa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Itens do checklist</Label>
            {itens.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const next = [...itens];
                    next[idx] = e.target.value;
                    setItens(next);
                  }}
                  placeholder="Descrição do item"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setItens([...itens, ""])}>
              <Plus className="h-3 w-3" /> Adicionar item
            </Button>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

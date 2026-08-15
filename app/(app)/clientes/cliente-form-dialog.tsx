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
import { Plus, Pencil } from "lucide-react";
import { criarCliente, atualizarCliente } from "@/lib/actions/clientes";

type ClienteExistente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  documento: string | null;
  observacoes: string | null;
};

export default function ClienteFormDialog({ cliente }: { cliente?: ClienteExistente }) {
  const isEdit = !!cliente;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    nome: cliente?.nome ?? "",
    telefone: cliente?.telefone ?? "",
    email: cliente?.email ?? "",
    endereco: cliente?.endereco ?? "",
    documento: cliente?.documento ?? "",
    observacoes: cliente?.observacoes ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (isEdit) {
        await atualizarCliente(cliente.id, form);
      } else {
        await criarCliente(form);
        setForm({ nome: "", telefone: "", email: "", endereco: "", documento: "", observacoes: "" });
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Novo cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar cliente" : "Novo cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Endereço</Label>
            <Input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Documento (CPF/CNPJ)</Label>
            <Input value={form.documento} onChange={(e) => set("documento", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
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

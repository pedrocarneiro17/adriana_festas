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
import { Plus, Pencil } from "lucide-react";
import { criarMaterial, atualizarMaterial } from "@/lib/actions/materiais";

type MaterialExistente = { id: string; nome: string; unidade: string };

export default function MaterialFormDialog({ material }: { material?: MaterialExistente }) {
  const isEdit = !!material;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [nome, setNome] = useState(material?.nome ?? "");
  const [unidade, setUnidade] = useState(material?.unidade ?? "un");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (isEdit) {
        await atualizarMaterial(material.id, { nome, unidade });
      } else {
        await criarMaterial({ nome, unidade });
        setNome("");
        setUnidade("un");
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
            <Plus className="h-4 w-4" /> Novo material
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar material" : "Novo material"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder='Ex: Balão dourado 9"' />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Unidade</Label>
            <Input value={unidade} onChange={(e) => setUnidade(e.target.value)} required placeholder="un, m, kg..." />
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

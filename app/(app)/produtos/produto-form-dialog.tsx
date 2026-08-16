"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { criarProduto, atualizarProduto, ProdutoMaterialInput } from "@/lib/actions/produtos";

type ProdutoExistente = {
  id: string;
  nome: string;
  valorUnitario: string;
  categoria: string | null;
  unidade: string;
  materiais: { materialId: string; quantidadeNecessaria: unknown }[];
};

type MaterialCatalogo = { id: string; nome: string; unidade: string };

export default function ProdutoFormDialog({
  produto,
  materiaisCatalogo,
}: {
  produto?: ProdutoExistente;
  materiaisCatalogo: MaterialCatalogo[];
}) {
  const isEdit = !!produto;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [valorUnitario, setValorUnitario] = useState(Number(produto?.valorUnitario ?? 0));
  const [categoria, setCategoria] = useState(produto?.categoria ?? "");
  const [unidade, setUnidade] = useState(produto?.unidade ?? "un");
  const [materiais, setMateriais] = useState<ProdutoMaterialInput[]>(
    produto?.materiais.map((m) => ({
      materialId: m.materialId,
      quantidadeNecessaria: Number(m.quantidadeNecessaria),
    })) ?? []
  );

  function addMaterial() {
    setMateriais([...materiais, { materialId: "", quantidadeNecessaria: 1 }]);
  }

  function updateMaterial(idx: number, field: keyof ProdutoMaterialInput, value: string | number) {
    const next = [...materiais];
    next[idx] = { ...next[idx], [field]: value };
    setMateriais(next);
  }

  function removeMaterial(idx: number) {
    setMateriais(materiais.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      nome,
      valorUnitario,
      categoria,
      unidade,
      materiais: materiais.filter((m) => m.materialId),
    };
    startTransition(async () => {
      if (isEdit) {
        await atualizarProduto(produto.id, payload);
      } else {
        await criarProduto(payload);
        setNome("");
        setValorUnitario(0);
        setCategoria("");
        setUnidade("un");
        setMateriais([]);
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
            <Plus className="h-4 w-4" /> Novo produto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Valor unitário</Label>
              <CurrencyInput value={valorUnitario} onValueChange={setValorUnitario} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Unidade</Label>
              <Input value={unidade} onChange={(e) => setUnidade(e.target.value)} placeholder="un, m², diária..." required />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Categoria</Label>
              <Input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ex: Decoração de mesa" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Materiais necessários (opcional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMaterial} disabled={materiaisCatalogo.length === 0}>
                <Plus className="h-3 w-3" /> Adicionar
              </Button>
            </div>
            {materiaisCatalogo.length === 0 ? (
              <p className="text-xs text-sand-500">
                Nenhum material cadastrado ainda.{" "}
                <Link href="/materiais" className="text-brand-700 hover:underline">
                  Cadastre materiais
                </Link>{" "}
                antes de vinculá-los a um produto.
              </p>
            ) : (
              materiais.map((m, idx) => {
                const selecionado = materiaisCatalogo.find((mc) => mc.id === m.materialId);
                return (
                  <div key={idx} className="grid grid-cols-[1fr_80px_32px] items-center gap-2">
                    <Select value={m.materialId} onValueChange={(v) => updateMaterial(idx, "materialId", v)}>
                      <SelectTrigger className="min-w-0">
                        <SelectValue placeholder="Selecione o material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materiaisCatalogo.map((mc) => (
                          <SelectItem key={mc.id} value={mc.id}>
                            {mc.nome} ({mc.unidade})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Qtd"
                      value={m.quantidadeNecessaria}
                      onChange={(e) => updateMaterial(idx, "quantidadeNecessaria", Number(e.target.value))}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(idx)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    {selecionado && <span className="col-span-3 -mt-1 text-xs text-sand-500">unidade: {selecionado.unidade}</span>}
                  </div>
                );
              })
            )}
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

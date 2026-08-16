"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { formatBRL } from "@/lib/utils";
import { criarOrcamento, atualizarOrcamentoRascunho } from "@/lib/actions/orcamentos";
import { verificarDataBloqueada } from "@/lib/actions/agenda";

type Cliente = { id: string; nome: string };
type Produto = { id: string; nome: string; valorUnitario: string };

type Props = {
  clientes: Cliente[];
  produtos: Produto[];
  orcamentoId?: string;
  initial?: {
    clienteId: string;
    desconto: string;
    validadeAte: string | null;
    observacoes: string | null;
    itens: { produtoId: string; quantidade: string }[];
  };
};

export default function OrcamentoForm({ clientes, produtos, orcamentoId, initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [clienteId, setClienteId] = useState(initial?.clienteId ?? "");
  const [clienteNovoAtivo, setClienteNovoAtivo] = useState(false);
  const [clienteNovo, setClienteNovo] = useState({ nome: "", telefone: "", email: "" });
  const [validadeAte, setValidadeAte] = useState(initial?.validadeAte?.slice(0, 10) ?? "");
  const [desconto, setDesconto] = useState(Number(initial?.desconto ?? 0));
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? "");
  const [itens, setItens] = useState(
    initial?.itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })) ?? [
      { produtoId: "", quantidade: "1" },
    ]
  );

  const total = useMemo(() => {
    const bruto = itens.reduce((acc, item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);
      if (!produto) return acc;
      return acc + Number(produto.valorUnitario) * Number(item.quantidade || 0);
    }, 0);
    return Math.max(0, bruto - desconto);
  }, [itens, produtos, desconto]);

  function addItem() {
    setItens([...itens, { produtoId: "", quantidade: "1" }]);
  }

  function updateItem(idx: number, field: "produtoId" | "quantidade", value: string) {
    const next = [...itens];
    next[idx] = { ...next[idx], [field]: value };
    setItens(next);
  }

  function removeItem(idx: number) {
    setItens(itens.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (validadeAte) {
      const bloqueada = await verificarDataBloqueada(validadeAte);
      if (bloqueada) {
        const continuar = window.confirm(
          `Esta data está marcada como fechada (${bloqueada.motivo || "sem motivo"}). Deseja continuar mesmo assim?`
        );
        if (!continuar) return;
      }
    }

    const payload = {
      clienteId: clienteNovoAtivo ? undefined : clienteId,
      clienteNovo: clienteNovoAtivo ? clienteNovo : undefined,
      validadeAte: validadeAte || undefined,
      desconto,
      observacoes,
      itens: itens
        .filter((i) => i.produtoId && Number(i.quantidade) > 0)
        .map((i) => ({ produtoId: i.produtoId, quantidade: Number(i.quantidade) })),
    };

    startTransition(async () => {
      if (orcamentoId) {
        await atualizarOrcamentoRascunho(orcamentoId, payload);
      } else {
        await criarOrcamento(payload);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!orcamentoId && (
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                className={`rounded-md px-3 py-1 ${!clienteNovoAtivo ? "bg-brand-600 text-white" : "bg-sand-200"}`}
                onClick={() => setClienteNovoAtivo(false)}
              >
                Cliente existente
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1 ${clienteNovoAtivo ? "bg-brand-600 text-white" : "bg-sand-200"}`}
                onClick={() => setClienteNovoAtivo(true)}
              >
                Novo cliente
              </button>
            </div>
          )}

          {clienteNovoAtivo && !orcamentoId ? (
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Nome"
                value={clienteNovo.nome}
                onChange={(e) => setClienteNovo({ ...clienteNovo, nome: e.target.value })}
                required
              />
              <Input
                placeholder="Telefone"
                value={clienteNovo.telefone}
                onChange={(e) => setClienteNovo({ ...clienteNovo, telefone: e.target.value })}
              />
              <Input
                placeholder="E-mail"
                value={clienteNovo.email}
                onChange={(e) => setClienteNovo({ ...clienteNovo, email: e.target.value })}
              />
            </div>
          ) : (
            <Select value={clienteId} onValueChange={setClienteId} disabled={!!orcamentoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-3 w-3" /> Adicionar item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {itens.map((item, idx) => {
            const produto = produtos.find((p) => p.id === item.produtoId);
            const subtotal = produto ? Number(produto.valorUnitario) * Number(item.quantidade || 0) : 0;
            return (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-2xl border border-[var(--color-divider)] p-2 sm:grid sm:grid-cols-[1fr_80px_110px_32px] sm:items-center sm:border-0 sm:p-0"
              >
                <Select value={item.produtoId} onValueChange={(v) => updateItem(idx, "produtoId", v)}>
                  <SelectTrigger className="min-w-0">
                    <SelectValue placeholder="Produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome} ({formatBRL(p.valorUnitario)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 sm:contents">
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantidade}
                    onChange={(e) => updateItem(idx, "quantidade", e.target.value)}
                    className="w-20 shrink-0 sm:w-auto"
                  />
                  <span className="flex-1 text-right text-sm text-sand-700 sm:flex-none">{formatBRL(subtotal)}</span>
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeItem(idx)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid grid-cols-2 gap-3 pt-4">
          <div className="flex flex-col gap-1.5">
            <Label>Validade até</Label>
            <Input type="date" value={validadeAte} onChange={(e) => setValidadeAte(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Desconto</Label>
            <CurrencyInput value={desconto} onValueChange={setDesconto} />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Observações</Label>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 p-4">
        <span className="text-sm font-medium text-brand-800">Total do orçamento</span>
        <span className="text-xl font-bold text-brand-800">{formatBRL(total)}</span>
      </div>

      <Button type="submit" disabled={isPending} className="w-full md:w-auto">
        {isPending ? "Salvando..." : "Salvar orçamento"}
      </Button>
    </form>
  );
}

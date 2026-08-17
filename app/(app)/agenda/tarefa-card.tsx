"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { alternarItemTarefa, adicionarItemTarefa, excluirTarefa, associarTarefaEvento } from "@/lib/actions/tarefas";
import { Trash2, Plus, PartyPopper } from "lucide-react";

type Tarefa = {
  id: string;
  titulo: string;
  data: string;
  itens: { id: string; descricao: string; concluido: boolean }[];
};

export default function TarefaCard({
  tarefa,
  readOnly,
  eventoAtual,
  eventosOptions,
}: {
  tarefa: Tarefa;
  readOnly?: boolean;
  eventoAtual?: { id: string; nome: string } | null;
  eventosOptions?: { id: string; label: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [novoItem, setNovoItem] = useState("");

  return (
    <Card className="border border-sage-200 bg-[var(--color-bg)]">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">
          {tarefa.titulo} <span className="font-normal text-sand-500">· {formatDate(tarefa.data)}</span>
        </CardTitle>
        {!readOnly && (
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={() => startTransition(() => excluirTarefa(tarefa.id))}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {eventoAtual && (
          <Link
            href={`/eventos/${eventoAtual.id}`}
            className="mb-1 flex w-fit items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-xs text-brand-800 hover:bg-brand-200"
          >
            <PartyPopper className="h-3 w-3" strokeWidth={2.75} /> {eventoAtual.nome}
          </Link>
        )}
        {tarefa.itens.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={item.concluido}
              disabled={isPending || readOnly}
              onCheckedChange={(checked) => startTransition(() => alternarItemTarefa(item.id, checked === true))}
            />
            <span className={item.concluido ? "text-sand-500 line-through" : ""}>{item.descricao}</span>
          </label>
        ))}
        {!readOnly && (
          <div className="flex gap-2 pt-1">
            <Input
              value={novoItem}
              onChange={(e) => setNovoItem(e.target.value)}
              placeholder="Novo item"
              className="h-8"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await adicionarItemTarefa(tarefa.id, novoItem);
                  setNovoItem("");
                })
              }
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
        {!readOnly && eventosOptions && (
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-xs text-sand-500">Vincular a um evento</span>
            <Select
              value={eventoAtual?.id ?? "nenhum"}
              onValueChange={(v) => startTransition(() => associarTarefaEvento(tarefa.id, v === "nenhum" ? null : v))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Nenhum (tarefa solta)</SelectItem>
                {eventosOptions.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

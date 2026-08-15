"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { alternarItemTarefa, adicionarItemTarefa, excluirTarefa } from "@/lib/actions/tarefas";
import { Trash2, Plus } from "lucide-react";

type Tarefa = {
  id: string;
  titulo: string;
  data: string;
  itens: { id: string; descricao: string; concluido: boolean }[];
};

export default function TarefaCard({ tarefa, readOnly }: { tarefa: Tarefa; readOnly?: boolean }) {
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
      </CardContent>
    </Card>
  );
}

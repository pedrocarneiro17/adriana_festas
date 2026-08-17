"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, ListChecks, Ban } from "lucide-react";
import { criarTarefa } from "@/lib/actions/tarefas";
import { criarDataBloqueada } from "@/lib/actions/agenda";
import { toDateInputValue, cn } from "@/lib/utils";

type Tipo = "tarefa" | "bloqueio";

function mesDeData(dataISO: string) {
  const [ano, mes] = dataISO.split("-");
  return `${ano}-${mes}`;
}

export default function NovoAgendaForm({ eventosOptions }: { eventosOptions: { id: string; label: string }[] }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("tarefa");
  const [isPending, startTransition] = useTransition();

  // tarefa
  const [titulo, setTitulo] = useState("");
  const [dataTarefa, setDataTarefa] = useState(toDateInputValue(new Date()));
  const [itens, setItens] = useState<string[]>([""]);
  const [eventoId, setEventoId] = useState("nenhum");

  // bloqueio
  const [dataInicioBloqueio, setDataInicioBloqueio] = useState(toDateInputValue(new Date()));
  const [dataFimBloqueio, setDataFimBloqueio] = useState("");
  const [motivo, setMotivo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tipo === "tarefa") {
      startTransition(async () => {
        await criarTarefa({ titulo, data: dataTarefa, eventoId: eventoId === "nenhum" ? null : eventoId, itens });
        router.push(`/agenda?mes=${mesDeData(dataTarefa)}`);
      });
    } else {
      startTransition(async () => {
        await criarDataBloqueada(dataInicioBloqueio, dataFimBloqueio || null, motivo);
        router.push(`/agenda?mes=${mesDeData(dataInicioBloqueio)}`);
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/agenda" className="flex w-fit items-center gap-1.5 text-sm text-sand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Voltar para agenda
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Novo item na agenda</h1>
        <p className="text-sm text-sand-600">Crie uma tarefa (solta ou vinculada a um evento) ou bloqueie uma data</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setTipo("tarefa")}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[28px] p-4 text-left transition-colors",
            tipo === "tarefa" ? "bg-[var(--color-accent)] text-[var(--color-bg)]" : "bg-[var(--color-surface)] text-sand-700"
          )}
        >
          <ListChecks className="h-5 w-5" strokeWidth={2.75} />
          <span className="font-[family-name:var(--font-heading)] font-normal text-lg">Tarefa</span>
          <span className="text-sm opacity-80">Um lembrete com checklist, solto ou vinculado a um evento</span>
        </button>
        <button
          type="button"
          onClick={() => setTipo("bloqueio")}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[28px] p-4 text-left transition-colors",
            tipo === "bloqueio" ? "bg-[var(--color-accent)] text-[var(--color-bg)]" : "bg-[var(--color-surface)] text-sand-700"
          )}
        >
          <Ban className="h-5 w-5" strokeWidth={2.75} />
          <span className="font-[family-name:var(--font-heading)] font-normal text-lg">Bloquear data</span>
          <span className="text-sm opacity-80">Marca um dia como fechado na agenda</span>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tipo === "tarefa" ? "Detalhes da tarefa" : "Detalhes do bloqueio"}</CardTitle>
        </CardHeader>
        <CardContent>
          {tipo === "tarefa" ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Título</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Data</Label>
                <Input type="date" value={dataTarefa} onChange={(e) => setDataTarefa(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Vincular a um evento (opcional)</Label>
                <Select value={eventoId} onValueChange={setEventoId}>
                  <SelectTrigger>
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
                <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setItens([...itens, ""])}>
                  <Plus className="h-3 w-3" /> Adicionar item
                </Button>
              </div>
              <Button type="submit" disabled={isPending} className="w-fit">
                {isPending ? "Salvando..." : "Salvar tarefa"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Data inicial</Label>
                  <Input
                    type="date"
                    value={dataInicioBloqueio}
                    onChange={(e) => setDataInicioBloqueio(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Data final (opcional)</Label>
                  <Input
                    type="date"
                    value={dataFimBloqueio}
                    min={dataInicioBloqueio}
                    onChange={(e) => setDataFimBloqueio(e.target.value)}
                    placeholder="mesmo dia"
                  />
                </div>
              </div>
              <p className="text-xs text-sand-500">
                Deixe a data final em branco para bloquear um único dia, ou preencha para bloquear um período.
              </p>
              <div className="flex flex-col gap-1.5">
                <Label>Motivo (opcional)</Label>
                <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: viagem, feriado" />
              </div>
              <Button type="submit" disabled={isPending} className="w-fit">
                {isPending ? "Salvando..." : "Bloquear"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function EventosFiltros({ clientes }: { clientes: { id: string; nome: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/eventos?${params.toString()}`);
  }

  const clienteId = searchParams.get("cliente") ?? "";
  const status = searchParams.get("status") ?? "";
  const de = searchParams.get("de") ?? "";
  const ate = searchParams.get("ate") ?? "";
  const temFiltros = clienteId || status || de || ate;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-[28px] bg-[var(--color-surface)] p-4">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Cliente</Label>
        <Select value={clienteId || "todos"} onValueChange={(v) => setParam("cliente", v === "todos" ? "" : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Status</Label>
        <Select value={status || "todos"} onValueChange={(v) => setParam("status", v === "todos" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="em_execucao">Em execução</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">De</Label>
        <Input type="date" value={de} onChange={(e) => setParam("de", e.target.value)} className="w-40" />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Até</Label>
        <Input type="date" value={ate} onChange={(e) => setParam("ate", e.target.value)} className="w-40" />
      </div>

      {temFiltros && (
        <Button variant="ghost" size="sm" onClick={() => router.push("/eventos")}>
          <X className="h-3 w-3" /> Limpar filtros
        </Button>
      )}
    </div>
  );
}

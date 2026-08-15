"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function FinanceiroFiltros({ clientes }: { clientes: { id: string; nome: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/financeiro?${params.toString()}`);
  }

  const clienteId = searchParams.get("cliente") ?? "";
  const de = searchParams.get("de") ?? "";
  const ate = searchParams.get("ate") ?? "";
  const temFiltros = clienteId || de || ate;

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
        <Label className="text-xs">Período de</Label>
        <Input type="date" value={de} onChange={(e) => setParam("de", e.target.value)} className="w-40" />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">até</Label>
        <Input type="date" value={ate} onChange={(e) => setParam("ate", e.target.value)} className="w-40" />
      </div>

      {temFiltros && (
        <Button variant="ghost" size="sm" onClick={() => router.push("/financeiro")}>
          <X className="h-3 w-3" /> Limpar filtros
        </Button>
      )}
    </div>
  );
}

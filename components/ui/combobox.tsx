"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboboxItem = {
  id: string;
  label: string;
  hint?: string;
  detail?: string | null;
  searchText?: string;
};

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder,
  emptyText = "Nada encontrado",
  className,
}: {
  items: ComboboxItem[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}) {
  const listId = useId();
  const selecionado = items.find((i) => i.id === value);
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [destaque, setDestaque] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtrados = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    if (termos.length === 0) return items;
    return items.filter((i) => {
      const alvo = normalizar(`${i.label} ${i.searchText ?? ""}`);
      return termos.every((t) => alvo.includes(t));
    });
  }, [items, busca]);

  useEffect(() => {
    if (!open) return;
    function fora(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setBusca("");
      }
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [open]);

  useEffect(() => {
    listRef.current?.children[destaque]?.scrollIntoView({ block: "nearest" });
  }, [destaque]);

  function escolher(id: string) {
    onChange(id);
    setOpen(false);
    setBusca("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setDestaque((d) => Math.min(d + 1, filtrados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDestaque((d) => Math.max(d - 1, 0));
    } else if (e.key === "Enter") {
      if (open) {
        e.preventDefault();
        if (filtrados[destaque]) escolher(filtrados[destaque].id);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setBusca("");
    }
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <input
        type="text"
        value={open ? busca : (selecionado?.label ?? "")}
        placeholder={open && selecionado ? selecionado.label : placeholder}
        onFocus={() => {
          setOpen(true);
          setDestaque(0);
        }}
        onChange={(e) => {
          setBusca(e.target.value);
          setOpen(true);
          setDestaque(0);
        }}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        className="flex h-9 w-full rounded-full border border-[var(--color-divider)] bg-[var(--color-surface)] pl-3.5 pr-9 py-1 text-base transition-colors placeholder:text-sand-500 focus-visible:outline-none focus-visible:border-[var(--color-accent)] md:text-sm"
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-500" />

      {open && (
        <ul
          id={listId}
          ref={listRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-[var(--color-divider)] bg-[var(--color-bg)] p-1 shadow-[var(--shadow-md)]"
        >
          {filtrados.length === 0 ? (
            <li className="px-3 py-2 text-sm text-sand-500">{emptyText}</li>
          ) : (
            filtrados.map((item, idx) => (
              <li
                key={item.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  escolher(item.id);
                }}
                onMouseEnter={() => setDestaque(idx)}
                className={cn(
                  "cursor-pointer rounded-xl px-3 py-1.5 text-sm",
                  idx === destaque && "bg-brand-100",
                  item.id === value && "font-medium"
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate">{item.label}</span>
                  {item.hint && <span className="shrink-0 text-xs text-sand-600">{item.hint}</span>}
                </div>
                {item.detail && <p className="line-clamp-1 text-xs text-sand-500">{item.detail}</p>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

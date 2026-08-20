"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

function toValue(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseValue(value: string | undefined) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return { y, m: m - 1, d };
}

export function DatePicker({
  value,
  onChange,
  disabled,
  className,
}: {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const parsed = parseValue(value);
  const today = new Date();
  const [viewYear, setViewYear] = useState(parsed?.y ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.m ?? today.getMonth());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function openPicker() {
    if (disabled) return;
    setViewYear(parsed?.y ?? today.getFullYear());
    setViewMonth(parsed?.m ?? today.getMonth());
    setOpen(true);
  }

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isSelected = (d: number) => parsed?.y === viewYear && parsed?.m === viewMonth && parsed?.d === d;
  const isToday = (d: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={cn(
          "flex h-9 items-center gap-2 rounded-full border border-[var(--color-divider)] bg-[var(--color-surface)] px-3.5 text-sm transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45",
          className
        )}
      >
        <Calendar className="h-3.5 w-3.5 text-[var(--color-accent)]" strokeWidth={2.5} />
        {parsed ? `${String(parsed.d).padStart(2, "0")}/${String(parsed.m + 1).padStart(2, "0")}/${parsed.y}` : "Selecionar data"}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[var(--color-divider)] bg-[var(--color-bg)] p-3 shadow-[var(--shadow-md)]">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.75} />
            </button>
            <span className="text-sm font-medium">
              {MESES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.75} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-sand-500">
            {DIAS_SEMANA.map((d, i) => (
              <span key={i} className="py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) =>
              d === null ? (
                <span key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(toValue(viewYear, viewMonth, d));
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors hover:bg-brand-100",
                    isSelected(d) && "bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent)]",
                    !isSelected(d) && isToday(d) && "border border-[var(--color-accent)]"
                  )}
                >
                  {d}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

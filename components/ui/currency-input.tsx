"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function centsToDisplay(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Máscara de moeda "acumuladora": os dígitos digitados entram sempre pela
// direita (como em apps bancários) — evita bug de cursor de máscaras que
// reformatam o texto inteiro a cada tecla.
const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
    value: number | string;
    onValueChange: (value: number) => void;
  }
>(({ className, value, onValueChange, ...props }, ref) => {
  const cents = Math.round(Number(value || 0) * 100);
  const display = cents === 0 ? "" : centsToDisplay(cents);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    const nextCents = digits ? parseInt(digits, 10) : 0;
    onValueChange(nextCents / 100);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-500">R$</span>
      <input
        ref={ref}
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        placeholder="0,00"
        className={cn(
          "flex h-9 w-full rounded-full border border-[var(--color-divider)] bg-[var(--color-surface)] py-1 pl-9 pr-3.5 text-base transition-colors placeholder:text-sand-500 focus-visible:outline-none focus-visible:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45 md:text-sm",
          className
        )}
        {...props}
      />
    </div>
  );
});
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };

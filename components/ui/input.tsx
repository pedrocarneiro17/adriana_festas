import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-full border border-[var(--color-divider)] bg-[var(--color-surface)] px-3.5 py-1 text-base transition-colors placeholder:text-sand-500 focus-visible:outline-none focus-visible:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

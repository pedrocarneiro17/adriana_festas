import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[70px] w-full rounded-2xl border border-[var(--color-divider)] bg-[var(--color-surface)] px-3.5 py-2 text-base placeholder:text-sand-500 focus-visible:outline-none focus-visible:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-45 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-slate-200",
        "placeholder:text-slate-500 outline-none transition-colors",
        "focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive/60 aria-invalid:ring-destructive/30",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };

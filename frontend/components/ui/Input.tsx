"use client";
import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className={cn("flex w-full flex-col gap-1", className)}>
        {label ? (
          <label className="text-sm text-[var(--gold)] font-medium" htmlFor={props.id}>
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          {...props}
        />
        {error ? <span className="text-xs text-red-400">{error}</span> : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
"use client";
import { cn } from "../../lib/utils";
import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = "primary",
  loading = false,
  ...props
}) => {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 ring-offset-2 ring-offset-black disabled:opacity-60 disabled:cursor-not-allowed shadow-[var(--shadow-glow-strong)]";
  const variants: Record<Variant, string> = {
    primary:
      "text-black border border-[var(--border)] hover:brightness-105",
    secondary:
      "bg-black/30 backdrop-blur-md text-[var(--text-secondary)] border border-yellow-800/30 hover:border-[var(--gold)]",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--gold)]",
    outline: "bg-transparent text-[var(--text-secondary)] border border-yellow-800/30 hover:border-[var(--gold)]",
  };
  return (
    <button
      className={cn(
        base,
        variant === "primary" ? "bg-gradient-to-b from-[var(--gold)] to-[var(--gold-soft)] hover:shadow-glow-strong" : "",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading ? <span className="mr-2 h-3 w-3 animate-spin border-2 border-black border-t-transparent rounded-full" /> : null}
      {children}
    </button>
  );
};

export default Button;
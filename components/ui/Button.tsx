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
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_16px_rgba(255,213,79,0.18)]";
  const variants: Record<Variant, string> = {
    primary:
      "text-black border border-[#FFCA28] hover:brightness-105 focus:ring-[var(--gold)] ring-offset-black",
    secondary:
      "bg-black/30 backdrop-blur-md text-[var(--foreground)] border border-yellow-800/30 hover:border-[var(--gold)]",
    ghost: "bg-transparent text-[var(--foreground)] hover:text-[var(--gold)]",
    outline: "bg-transparent text-[var(--foreground)] border border-yellow-800/30 hover:border-[var(--gold)]",
  };
  return (
    <button
      className={cn(
        base,
        variant === "primary" ? "[background-image:linear-gradient(180deg,#FFD54F_0%,#FFC107_55%,#FFB300_100%)]" : "",
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
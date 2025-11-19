"use client";
import React from "react";
import { cn } from "../../lib/utils";

export const Table: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <table className={cn("w-full text-sm soft-border rounded-xl overflow-hidden", className)}>{children}</table>
);
export const THead: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <thead className={cn("bg-[var(--panel)] text-[var(--gold-muted)]", className)}>{children}</thead>
);
export const TBody: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <tbody className={cn("divide-y divide-[var(--panel)]", className)}>{children}</tbody>
);
export const TR: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <tr className={cn("transition-all duration-300 hover:bg-black/40 hover:shadow-[var(--shadow-glow)] hover:outline hover:outline-1 hover:outline-[var(--gold)]/20", className)}>
    {children}
  </tr>
);
export const TH: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <th
    {...props}
    className={cn("text-left px-3 py-2 font-semibold text-[var(--gold-soft)]", className)}
  >
    {children}
  </th>
);
export const TD: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <td className={cn("px-3 py-2 align-middle text-[var(--text-secondary)]", className)}>{children}</td>
);

export default Table;
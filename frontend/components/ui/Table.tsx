"use client";
import React from "react";
import { cn } from "../../lib/utils";

export const Table: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <table className={cn("w-full text-sm soft-border rounded-md overflow-hidden", className)}>{children}</table>
);
export const THead: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <thead className={cn("bg-zinc-900 text-zinc-300", className)}>{children}</thead>
);
export const TBody: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <tbody className={cn("divide-y divide-zinc-800", className)}>{children}</tbody>
);
export const TR: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <tr className={cn("transition-all duration-300 hover:bg-black/40 hover:outline hover:outline-1 hover:outline-yellow-500/20", className)}>
    {children}
  </tr>
);
export const TH: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
  <th
    {...props}
    className={cn("text-left px-3 py-2 font-medium", className)}
  >
    {children}
  </th>
);
export const TD: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <td className={cn("px-3 py-2 align-middle", className)}>{children}</td>
);

export default Table;
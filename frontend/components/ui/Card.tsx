"use client";
import React from "react";
import { cn } from "../../lib/utils";

export const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => {
  return <div className={cn("card p-6", className)}>{children}</div>;
};

export const CardHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => {
  return <div className={cn("mb-4 flex items-center justify-between", className)}>{children}</div>;
};

export const CardTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => {
  return <h3 className={cn("font-bold text-xl text-[var(--gold)] tracking-tight", className)}>{children}</h3>;
};

export const CardContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => {
  return <div className={cn("text-sm text-[var(--gold-soft)]/90", className)}>{children}</div>;
};

export default Card;
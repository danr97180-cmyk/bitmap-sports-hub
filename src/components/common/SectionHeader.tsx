import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({ title, action, icon, className }: { title: string; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3", className)}>
      <h2 className="flex min-w-0 items-center gap-2 text-base font-bold sm:text-lg">
        <span className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
        {icon}
        <span className="truncate">{title}</span>
      </h2>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function LiveDot({ className }: { className?: string }) {
  return <span className={cn("inline-block h-2 w-2 animate-pulse-live rounded-full bg-live", className)} aria-hidden="true" />;
}

import { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("card-surface rounded-lg p-6", className)}>{children}</div>;
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={clsx("block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5", props.className)}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-sm bg-black/40 border border-border-subtle px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition",
        props.className
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full rounded-sm bg-black/40 border border-border-subtle px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition",
        props.className
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full rounded-sm bg-black/40 border border-border-subtle px-3 py-2 text-sm text-white focus:outline-none focus:border-gold transition",
        props.className
      )}
    />
  );
}

export function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card-surface rounded-lg p-5">
      <p className="text-xs uppercase tracking-wider text-muted mb-2">{label}</p>
      <p className="font-display text-4xl font-bold gold-text leading-none">{value}</p>
      {sub && <p className="text-xs text-white/40 mt-2">{sub}</p>}
    </div>
  );
}

export function Pill({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "green" | "red" | "gray" }) {
  const tones: Record<string, string> = {
    gold: "bg-gold/15 text-gold border border-gold/40",
    green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    red: "bg-red-500/15 text-red-400 border border-red-500/30",
    gray: "bg-white/10 text-white/60 border border-white/10",
  };
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

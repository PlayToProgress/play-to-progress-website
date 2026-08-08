import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "gold" | "black" | "outline" | "ghost";

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }
>(({ className, variant = "gold", loading = false, disabled, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold tracking-wide transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "gold" && "btn-gold",
        variant === "black" && "bg-black text-white border border-white/10 hover:border-white/30",
        variant === "outline" && "border border-gold text-gold hover:bg-gold/10",
        variant === "ghost" && "text-white/70 hover:text-white",
        className
      )}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
});
Button.displayName = "Button";

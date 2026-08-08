"use client";

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";
import clsx from "clsx";

type ToastTone = "error" | "success" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, string> = {
  error: "border-red-500/40 bg-red-950/90 text-red-100",
  success: "border-gold/40 bg-black/95 text-white",
  info: "border-white/20 bg-black/95 text-white",
};

/**
 * Extracts a human-readable message from whatever apiFetch's catch block
 * hands back — an Error instance, a raw string, or (rarely) something else —
 * so every call site can just do `showToast(errorMessage(err))` without
 * repeating this logic.
 */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, tone: ToastTone = "error") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={clsx(
              "rounded-md border px-4 py-3 text-sm shadow-lg backdrop-blur-sm flex items-start justify-between gap-3 toast-enter",
              TONE_STYLES[t.tone]
            )}
          >
            <span className="leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-xs text-white/50 hover:text-white cursor-pointer shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider (check app/providers.tsx).");
  }
  return ctx;
}

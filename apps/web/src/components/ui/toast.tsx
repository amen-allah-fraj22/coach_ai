"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

interface ToastItem {
  id: number;
  message: string;
  variant: "default" | "destructive";
}

interface ToastContextValue {
  show: (message: string, variant?: ToastItem["variant"]) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/** DESIGN.md "Match Clock Lower-Third": Night Pitch block, 2px Chalk top border, Anton label. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const mounted = useMounted();
  const nextId = React.useRef(0);

  const show = React.useCallback((message: string, variant: ToastItem["variant"] = "default") => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((toast) => toast.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
            <AnimatePresence>
              {toasts.map((toast) => (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  className={cn(
                    "pointer-events-auto w-full max-w-sm border-t-2 bg-night-pitch px-4 py-3 text-sm text-chalk",
                    toast.variant === "destructive" ? "border-t-touchline-red" : "border-t-chalk",
                  )}
                >
                  <span className="font-display uppercase tracking-tight">{toast.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

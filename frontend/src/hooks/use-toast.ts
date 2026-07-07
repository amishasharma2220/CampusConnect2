import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCount = 0;

const listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export function toast(t: Omit<Toast, "id">) {
  const id = String(++toastCount);
  toasts = [...toasts, { ...t, id }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== id);
    notify();
  }, 4000);
}

export function useToast() {
  const [state, setState] = useState<Toast[]>(toasts);

  const subscribe = useCallback((fn: (t: Toast[]) => void) => {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);

  useState(() => {
    const unsub = subscribe(setState);
    return unsub;
  });

  return { toasts: state, toast };
}
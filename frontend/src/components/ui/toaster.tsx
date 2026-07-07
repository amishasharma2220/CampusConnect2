import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl border px-4 py-3 shadow-card text-sm max-w-sm bg-card ${
            t.variant === "destructive" ? "border-destructive text-destructive" : "border-border text-foreground"
          }`}
        >
          <p className="font-semibold">{t.title}</p>
          {t.description && <p className="text-muted-foreground mt-1">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
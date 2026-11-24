import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { chatApi, type ChatTurn } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { ChatMessageText } from "./ChatMessageText";

const SUGGESTIONS = [
  "What tech events are coming up?",
  "Which clubs can I join for photography?",
  "What am I registered for?",
  "How do I become a club admin?",
];

const MAX_LENGTH = 1000;

/**
 * Floating "Ask CampusConnect" assistant, shown to logged-in users only.
 * The conversation lives in memory for this tab and is sent to the backend
 * with each question; nothing is stored on the server.
 */
export function ChatAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Bumped on "New chat" so a reply to an older conversation is ignored.
  const conversationRef = useRef(0);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, error]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!user) return null;

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  const send = async (text: string, fromSuggestion = false) => {
    const question = text.trim();
    if (!question || busy) return;
    const conversation = conversationRef.current;
    const before = messages;
    const next: ChatTurn[] = [...before, { role: "user", content: question.slice(0, MAX_LENGTH) }];
    setMessages(next);
    if (!fromSuggestion) setInput("");
    setError(null);
    setBusy(true);
    try {
      const { reply } = await chatApi.send(next);
      if (conversation !== conversationRef.current) return;
      setMessages([...next, { role: "assistant", content: reply }]);
      setAnnouncement(reply);
    } catch (err: unknown) {
      if (conversation !== conversationRef.current) return;
      // Drop the unanswered question so the history stays user/assistant pairs.
      setMessages(before);
      if (!fromSuggestion) setInput(question);
      setError(getErrorMessage(err));
    } finally {
      if (conversation === conversationRef.current) setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const reset = () => {
    conversationRef.current += 1;
    setMessages([]);
    setError(null);
    setBusy(false);
    setInput("");
    setAnnouncement("");
    inputRef.current?.focus();
  };

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label="Ask CampusConnect"
          onKeyDown={(e) => e.key === "Escape" && close()}
          className="fixed bottom-24 right-4 z-50 flex h-[min(600px,calc(100dvh-8rem))] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-warm sm:right-6"
        >
          <header className="flex items-center gap-3 bg-hero-gradient px-4 py-3 text-primary-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-semibold leading-tight">Ask CampusConnect</h2>
              <p className="text-xs text-primary-foreground/85">Answers from live events and clubs</p>
            </div>
            {messages.length > 0 && !busy && (
              <button type="button" onClick={reset} className="rounded-lg p-2 hover:bg-white/15" aria-label="Start a new chat" title="New chat">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={close} className="rounded-lg p-2 hover:bg-white/15" aria-label="Close assistant">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-foreground">
                  Hi! Ask me about events, clubs, fees, or your registrations.
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s, true)}
                      className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-left text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-primary-foreground">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[90%] rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-foreground">
                  <ChatMessageText text={m.content} onNavigate={() => setOpen(false)} />
                </div>
              ),
            )}

            {busy && (
              <div role="status" className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-3">
                <span className="sr-only">Assistant is typing</span>
                {[0, 150, 300].map((d) => (
                  <span key={d} aria-hidden className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            )}

            {error && (
              <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-destructive">
                {error}
              </div>
            )}
          </div>
          <p className="sr-only" aria-live="polite">{announcement}</p>

          <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-border p-3">
            <label htmlFor="chat-input" className="sr-only">Your question</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={MAX_LENGTH}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask about events or clubs…"
              className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-hero-gradient text-primary-foreground transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="px-4 pb-2 text-center text-[11px] text-muted-foreground">
            AI answers can be wrong. Check details on the event page.
          </p>
        </section>
      )}

      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-hero-gradient text-primary-foreground shadow-warm transition-transform hover:scale-105 sm:right-6"
        aria-label={open ? "Close assistant" : "Ask CampusConnect"}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}

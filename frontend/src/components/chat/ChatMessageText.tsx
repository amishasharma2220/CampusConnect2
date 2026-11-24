import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Renders the assistant's reply: plain text with a tiny markdown subset
 * (**bold**, [label](/path) links, "- " bullets).
 *
 * No HTML is ever injected. Links are only clickable when they point to a
 * page inside CampusConnect ("/events/...", "/join-club?club=..."); anything
 * else is shown as plain text, so a reply can never send someone to an
 * outside site.
 */
const INLINE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !href.includes("\\");
}

function renderInline(text: string, onNavigate?: () => void): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > last) out.push(text.slice(last, index));
    const [, bold, label, href] = match;
    if (bold) {
      out.push(<strong key={index} className="font-semibold">{bold}</strong>);
    } else if (label && href && isInternal(href)) {
      out.push(
        <Link key={index} to={href} onClick={onNavigate} className="font-medium text-primary underline underline-offset-2 hover:opacity-80">
          {label}
        </Link>,
      );
    } else {
      out.push(label ?? match[0]);
    }
    last = index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function ChatMessageText({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const blocks: ReactNode[] = [];
  let items: string[] = [];
  let ordered = false;

  const flush = (key: number) => {
    if (!items.length) return;
    const children = items.map((b, i) => <li key={i}>{renderInline(b, onNavigate)}</li>);
    blocks.push(
      ordered
        ? <ol key={`l-${key}`} className="my-1 list-decimal space-y-1 pl-5">{children}</ol>
        : <ul key={`l-${key}`} className="my-1 list-disc space-y-1 pl-5">{children}</ul>,
    );
    items = [];
  };

  text.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    const item = line.match(/^\s*([-*•]|\d+[.)])\s+(.*)$/);
    if (item) {
      const isNumber = /\d/.test(item[1]);
      if (items.length && isNumber !== ordered) flush(i);
      ordered = isNumber;
      items.push(item[2]);
      return;
    }
    flush(i);
    if (line.trim()) blocks.push(<p key={i}>{renderInline(line, onNavigate)}</p>);
  });
  flush(-1);

  return <div className="space-y-1.5 break-words">{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>;
}

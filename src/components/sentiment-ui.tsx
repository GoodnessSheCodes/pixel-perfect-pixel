import type { SentimentLabel } from "@/lib/sentiment";
import { fmtScore } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { Frown, Meh, Smile } from "lucide-react";
import type { ReactNode } from "react";

export const LABEL_STYLES: Record<SentimentLabel, { text: string; bg: string; soft: string; fill: string; Icon: typeof Smile }> = {
  Positive: { text: "text-positive", bg: "bg-positive", soft: "bg-positive-soft", fill: "var(--positive)", Icon: Smile },
  Neutral: { text: "text-neutral", bg: "bg-neutral", soft: "bg-neutral-soft", fill: "var(--neutral)", Icon: Meh },
  Negative: { text: "text-negative", bg: "bg-negative", soft: "bg-negative-soft", fill: "var(--negative)", Icon: Frown },
};

export function SentimentBadge({ label, className }: { label: SentimentLabel; className?: string }) {
  const s = LABEL_STYLES[label];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", s.soft, s.text, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.bg)} aria-hidden />
      {label}
    </span>
  );
}

export function ScoreText({ score, className }: { score: number; className?: string }) {
  const label: SentimentLabel = score >= 0.1 ? "Positive" : score <= -0.1 ? "Negative" : "Neutral";
  return <span className={cn("tabular", LABEL_STYLES[label].text, className)}>{fmtScore(score)}</span>;
}

/** Horizontal −1…+1 scale with marker. */
export function SentimentScale({ score }: { score: number }) {
  const pos = ((score + 1) / 2) * 100;
  return (
    <div>
      <div className="relative h-3 rounded-full" style={{ background: "linear-gradient(90deg, var(--negative), var(--neutral) 50%, var(--positive))" }}>
        <div className="absolute inset-y-0 left-[45%] right-[45%] border-x border-card/70" aria-hidden />
        <div
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-card bg-foreground shadow-md transition-[left] duration-700 ease-out"
          style={{ left: `${pos}%` }}
          role="img"
          aria-label={`Score ${fmtScore(score)} on a scale from −1 to +1`}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>−1.00 Negative</span>
        <span>Neutral band ±0.10</span>
        <span>Positive +1.00</span>
      </div>
    </div>
  );
}

export function Card({ title, eyebrow, children, className, action }: { title?: string; eyebrow?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("paper-card p-5 animate-rise", className)}>
      {(title || eyebrow) && (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            {title && <h2 className="mt-1 text-lg font-semibold">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-border px-6 py-12 text-center grid-paper">
      <p className="font-serif text-lg">{title}</p>
      {children && <div className="mt-2 max-w-md text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

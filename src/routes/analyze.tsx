import { createFileRoute } from "@tanstack/react-router";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Disclaimer, Workflow } from "@/components/notes";
import { Card, LABEL_STYLES, ScoreText, SentimentBadge, SentimentScale } from "@/components/sentiment-ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCorpus } from "@/lib/store";
import type { AnalyzedRecord } from "@/lib/stats";
import { tokenize } from "@/lib/sentiment";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Text — Sentiment Analysis Tool" },
      { name: "description", content: "Paste any text to detect its sentiment, confidence, score and key phrases." },
      { property: "og:title", content: "Analyze Text — Sentiment Analysis Tool" },
      { property: "og:description", content: "Detect Positive, Neutral or Negative sentiment with a transparent NLP method." },
    ],
  }),
  component: AnalyzePage,
});

const EXAMPLES = [
  "I absolutely love this product. The quality is excellent!",
  "The delivery was late and the box arrived damaged. Very disappointing.",
  "The parcel was delivered on Tuesday to the front desk.",
  "The design is beautiful, but the battery is not good at all.",
];

const MAX = 2000;

function Highlighted({ rec }: { rec: AnalyzedRecord }) {
  const values = new Map(rec.result.hits.map((h) => [h.word, h.value]));
  const parts = rec.text.split(/(\s+)/);
  return (
    <p className="leading-8">
      {parts.map((p, i) => {
        const key = tokenize(p).filter((t) => /^[a-z0-9]+$/.test(t))[0];
        const v = key ? values.get(key) : undefined;
        if (v === undefined) return <span key={i}>{p}</span>;
        return (
          <mark key={i} className={`rounded px-1 ${v > 0 ? "bg-positive-soft text-positive" : "bg-negative-soft text-negative"}`} title={`weight ${v.toFixed(2)}`}>
            {p}
          </mark>
        );
      })}
    </p>
  );
}

function AnalyzePage() {
  const { addManual } = useCorpus();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzedRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    const t = text.trim();
    if (t.length < 3) {
      setError("Please enter at least a few words to analyse.");
      return;
    }
    if (!/[a-zA-Z]/.test(t)) {
      setError("The text must contain words — numbers or symbols alone cannot be analysed.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const rec = addManual(t);
      setResult(rec);
      setLoading(false);
      toast.success(`Classified as ${rec.result.label} and added to the dataset.`);
    }, 450);
  };

  const clear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  const r = result?.result;
  const style = r ? LABEL_STYLES[r.label] : null;

  return (
    <>
      <PageHeader eyebrow="Tool · Single text" title="Analyze Text" description="Enter or paste a review, comment or any short text. Each analysis is added to the dataset so the dashboard and report update automatically." />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3" eyebrow="Input" title="Your text">
          <label htmlFor="input-text" className="sr-only">Text to analyse</label>
          <Textarea
            id="input-text"
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run();
            }}
            placeholder="e.g. The support team was incredibly helpful and fixed my problem quickly."
            className="min-h-48 resize-y bg-background text-base"
            aria-invalid={!!error}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{error ? <span className="text-destructive">{error}</span> : "Tip: press Ctrl/⌘ + Enter to analyse."}</span>
            <span className="tabular">
              {text.length}/{MAX}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={run} disabled={loading || !text.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Analysing…" : "Analyze Sentiment"}
            </Button>
            <Button variant="outline" onClick={clear} disabled={loading || (!text && !result)}>
              <RotateCcw className="h-4 w-4" /> Clear
            </Button>
          </div>
          <div className="mt-6">
            <div className="eyebrow mb-2">Try an example</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((e) => (
                <button key={e} onClick={() => { setText(e); setResult(null); setError(null); }} className="rounded-full border border-border bg-background px-3 py-1 text-left text-xs hover:bg-muted">
                  {e.length > 48 ? e.slice(0, 48) + "…" : e}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2" eyebrow="Output" title="Result">
          {loading ? (
            <div className="space-y-4" aria-live="polite">
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ) : r && style && result ? (
            <div className="space-y-6 animate-rise" aria-live="polite">
              <div className={`flex items-center gap-4 rounded-lg p-4 ${style.soft}`}>
                <style.Icon className={`h-10 w-10 ${style.text}`} aria-hidden />
                <div>
                  <div className="eyebrow">Detected sentiment</div>
                  <div className={`font-serif text-3xl font-semibold ${style.text}`}>{r.label}</div>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-3">
                  <dt className="eyebrow">Confidence</dt>
                  <dd className="tabular mt-1 text-2xl font-semibold">{r.confidence}%</dd>
                  <div className="mt-2 h-1.5 rounded-full bg-muted">
                    <div className={`h-1.5 rounded-full ${style.bg}`} style={{ width: `${r.confidence}%` }} />
                  </div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <dt className="eyebrow">Sentiment score</dt>
                  <dd className="mt-1 text-2xl font-semibold">
                    <ScoreText score={r.score} />
                  </dd>
                  <div className="mt-2 text-xs text-muted-foreground">{r.tokenCount} tokens</div>
                </div>
              </dl>
              <SentimentScale score={r.score} />
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-border text-center grid-paper">
              <p className="max-w-xs text-sm text-muted-foreground">Results will appear here after you click <strong>Analyze Sentiment</strong>.</p>
            </div>
          )}
        </Card>
      </div>

      {r && result && !loading && (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3" eyebrow="Explanation" title="Why this result?">
            <p className="text-sm leading-relaxed">{r.explanation}</p>
            <div className="mt-5 rounded-lg bg-muted/60 p-4 text-sm">
              <div className="eyebrow mb-2">Annotated text</div>
              <Highlighted rec={result} />
            </div>
          </Card>
          <Card className="lg:col-span-2" eyebrow="Features" title="Important keywords & phrases">
            {r.hits.length ? (
              <ul className="space-y-2">
                {[...r.hits].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 10).map((h, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <SentimentBadge label={h.value > 0 ? "Positive" : "Negative"} />
                      <span>{h.phrase}</span>
                      {h.negated && <span className="text-xs text-muted-foreground">(negated)</span>}
                    </span>
                    <ScoreText score={h.value / 3} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No sentiment-bearing words were detected.</p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">Weights shown normalised to −1…+1 (lexicon values divided by 3).</p>
          </Card>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card eyebrow="Methodology" title="How it works">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sentiment analysis uses natural language processing (NLP) to identify the emotional polarity of text. This tool tokenises your text, looks up each word in a
            sentiment lexicon, adjusts weights for negation (“not good”), intensifiers (“very”), contrast (“but”) and exclamation, then normalises the total into a
            compound score from −1 to +1. Scores ≥ +0.10 are Positive, ≤ −0.10 Negative, and the rest Neutral.
          </p>
          <div className="mt-4">
            <Workflow />
          </div>
        </Card>
        <Disclaimer />
      </div>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Info } from "lucide-react";
import { useMemo } from "react";
import { AppShellNote } from "@/components/notes";
import { CategoryBars, DonutChart, KeywordBars, MonthlyStacked, ScoreLine } from "@/components/charts";
import { PageHeader } from "@/components/AppShell";
import { Card, EmptyState, LABEL_STYLES, ScoreText, SentimentBadge, SentimentScale } from "@/components/sentiment-ui";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCorpus } from "@/lib/store";
import { byCategory, byMonth, fmtScore, summarize, topSentimentWords } from "@/lib/stats";
import type { SentimentLabel } from "@/lib/sentiment";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Sentiment Analysis Tool" },
      { name: "description", content: "Live dashboard of sentiment distribution, trends, keywords and recent analysed texts." },
      { property: "og:title", content: "Dashboard — Sentiment Analysis Tool" },
      { property: "og:description", content: "Analyze opinions, discover patterns, and generate actionable insights." },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, sub, tone, tip }: { label: string; value: string; sub?: string; tone?: SentimentLabel; tip: string }) {
  return (
    <div className="paper-card relative overflow-hidden p-5 animate-rise">
      {tone && <span className={`absolute inset-x-0 top-0 h-1 ${LABEL_STYLES[tone].bg}`} aria-hidden />}
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <Tooltip>
          <TooltipTrigger aria-label={`About ${label}`} className="text-muted-foreground hover:text-foreground">
            <Info className="h-3.5 w-3.5" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{tip}</TooltipContent>
        </Tooltip>
      </div>
      <div className={`mt-3 tabular text-3xl font-semibold ${tone ? LABEL_STYLES[tone].text : ""}`}>{value}</div>
      {sub && <div className="mt-1 text-sm text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Dashboard() {
  const { records } = useCorpus();
  const s = useMemo(() => summarize(records), [records]);
  const months = useMemo(() => byMonth(records), [records]);
  const cats = useMemo(() => byCategory(records), [records]);
  const pos = useMemo(() => topSentimentWords(records, "pos"), [records]);
  const neg = useMemo(() => topSentimentWords(records, "neg"), [records]);
  const recent = useMemo(() => [...records].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 6), [records]);

  return (
    <>
      <PageHeader
        eyebrow="Overview · Dashboard"
        title="Sentiment Analysis Tool"
        description="Analyze opinions, discover patterns, and generate actionable insights."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/report">Insights report</Link>
            </Button>
            <Button asChild>
              <Link to="/analyze">
                Analyze text <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      {s.total === 0 ? (
        <EmptyState title="No texts in the corpus yet">
          Analyze a text or upload a CSV on the <Link to="/dataset" className="underline">Dataset</Link> page to populate the dashboard.
        </EmptyState>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Texts analysed" value={String(s.total)} sub={`Avg. confidence ${s.avgConfidence}%`} tip="Total number of records in the active corpus (sample data, uploads and manual entries)." />
            <Stat label="Positive" tone="Positive" value={`${s.pctPositive}%`} sub={`${s.positive} texts`} tip="Texts with compound score ≥ +0.10." />
            <Stat label="Neutral" tone="Neutral" value={`${s.pctNeutral}%`} sub={`${s.neutral} texts`} tip="Texts with compound score between −0.10 and +0.10." />
            <Stat label="Negative" tone="Negative" value={`${s.pctNegative}%`} sub={`${s.negative} texts`} tip="Texts with compound score ≤ −0.10." />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card eyebrow="Overall sentiment score" title={fmtScore(s.avgScore)} className="lg:col-span-1">
              <p className="mb-6 text-sm text-muted-foreground">Mean compound score across all {s.total} texts, on a scale from −1 (very negative) to +1 (very positive).</p>
              <SentimentScale score={s.avgScore} />
              <AppShellNote />
            </Card>
            <Card eyebrow="Figure 1" title="Sentiment distribution">
              <DonutChart s={s} />
              <div className="mt-2 flex justify-center gap-4 text-xs">
                {(["Positive", "Neutral", "Negative"] as const).map((l) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${LABEL_STYLES[l].bg}`} />
                    {l}
                  </span>
                ))}
              </div>
            </Card>
            <Card eyebrow="Figure 2" title="Mean score over time">
              <ScoreLine data={months} />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card eyebrow="Figure 3" title="Sentiment trend by month">
              <MonthlyStacked data={months} />
            </Card>
            <Card eyebrow="Figure 4" title="Sentiment by category">
              <CategoryBars data={cats} />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card eyebrow="Lexicon hits" title="Most common positive keywords">
              <KeywordBars items={pos} tone="positive" />
            </Card>
            <Card eyebrow="Lexicon hits" title="Most common negative keywords">
              <KeywordBars items={neg} tone="negative" />
            </Card>
          </div>

          <Card
            eyebrow="Latest"
            title="Recently analysed texts"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/dataset">View all</Link>
              </Button>
            }
          >
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <span className="tabular w-24 shrink-0 text-xs text-muted-foreground">{r.date}</span>
                  <p className="flex-1 text-sm">{r.text}</p>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-xs text-muted-foreground md:inline">{r.category}</span>
                    <ScoreText score={r.result.score} className="text-sm" />
                    <SentimentBadge label={r.result.label} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Copy, FileDown, FileText, Loader2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { CategoryBars, DonutChart, ScoreLine } from "@/components/charts";
import { Disclaimer } from "@/components/notes";
import { EmptyState } from "@/components/sentiment-ui";
import { Button } from "@/components/ui/button";
import { generateReport, reportToText, type ReportSection } from "@/lib/report";
import { byCategory, byMonth, summarize } from "@/lib/stats";
import { useCorpus } from "@/lib/store";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Insights Report — Sentiment Analysis Tool" },
      { name: "description", content: "Automatically generated academic-style report summarising sentiment findings, themes, trends and recommendations." },
      { property: "og:title", content: "Insights Report — Sentiment Analysis Tool" },
      { property: "og:description", content: "Executive summary, key findings, trends and recommendations generated from the analysed data." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { records } = useCorpus();
  const [report, setReport] = useState<{ sections: ReportSection[]; at: string; n: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const s = useMemo(() => summarize(records), [records]);
  const months = useMemo(() => byMonth(records), [records]);
  const cats = useMemo(() => byCategory(records), [records]);
  const stale = report && report.n !== records.length;

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      setReport({
        sections: generateReport(records),
        at: new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" }),
        n: records.length,
      });
      setLoading(false);
    }, 600);
  };

  const copy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(reportToText(report.sections, report.at));
      toast.success("Report copied to clipboard.");
    } catch {
      toast.error("Clipboard access was blocked by the browser.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Output · Report"
        title="Insights Report"
        description="An academic-style summary generated dynamically from the current dataset."
        actions={
          <>
            {report && (
              <>
                <Button variant="outline" onClick={copy}><Copy className="h-4 w-4" /> Copy</Button>
                <Button variant="outline" onClick={() => window.print()}><FileDown className="h-4 w-4" /> Download PDF</Button>
              </>
            )}
            <Button onClick={generate} disabled={loading || !records.length}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : report ? <RefreshCw className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {loading ? "Generating…" : report ? "Regenerate" : "Generate Report"}
            </Button>
          </>
        }
      />

      {!records.length ? (
        <EmptyState title="There is no data to report on">Add texts on the Analyze or Dataset page first.</EmptyState>
      ) : loading ? (
        <div className="paper-card mx-auto max-w-3xl space-y-4 p-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${60 + ((i * 17) % 40)}%` }} />
          ))}
        </div>
      ) : !report ? (
        <EmptyState title="Ready to generate">
          Click <strong>Generate Report</strong> to produce an executive summary, key findings, theme analysis, trends and recommendations from the {records.length} texts currently loaded.
        </EmptyState>
      ) : (
        <article className="paper-card print-full mx-auto max-w-3xl px-6 py-10 sm:px-12 animate-rise">
          {stale && (
            <div className="no-print mb-6 rounded-md bg-accent p-3 text-sm text-accent-foreground">
              The dataset has changed since this report was generated. Click <strong>Regenerate</strong> to update it.
            </div>
          )}
          <header className="border-b border-border pb-6 text-center">
            <div className="eyebrow">Sentiment Analysis Tool · Insights Report</div>
            <h2 className="mt-3 text-3xl font-semibold">Sentiment Analysis of {report.n} Texts</h2>
            <p className="mt-2 text-sm text-muted-foreground">Generated {report.at}</p>
          </header>

          {report.sections.map((sec, i) => (
            <section key={sec.title} className="mt-8 break-inside-avoid">
              <h3 className="text-xl font-semibold">
                <span className="tabular mr-2 text-base text-muted-foreground">{i + 1}.</span>
                {sec.title}
              </h3>
              {sec.paragraphs.map((p, j) => (
                <p key={j} className="mt-3 leading-relaxed">{p}</p>
              ))}
              {sec.bullets && (
                <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed marker:text-highlight">
                  {sec.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
              {sec.title === "Sentiment Distribution" && !stale && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <figure><DonutChart s={s} /><figcaption className="eyebrow text-center">Fig. A — Distribution</figcaption></figure>
                  <figure><CategoryBars data={cats} /><figcaption className="eyebrow text-center">Fig. B — By category</figcaption></figure>
                </div>
              )}
              {sec.title === "Trends" && months.length > 1 && !stale && (
                <figure className="mt-4"><ScoreLine data={months} /><figcaption className="eyebrow text-center">Fig. C — Mean monthly score</figcaption></figure>
              )}
            </section>
          ))}
          <div className="mt-10"><Disclaimer /></div>
        </article>
      )}
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Download, RotateCcw, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Card, EmptyState, ScoreText, SentimentBadge } from "@/components/sentiment-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CountBar } from "@/components/charts";
import { extractRows } from "@/lib/csv";
import { useCorpus } from "@/lib/store";
import { summarize } from "@/lib/stats";

export const Route = createFileRoute("/dataset")({
  head: () => ({
    meta: [
      { title: "Dataset — Sentiment Analysis Tool" },
      { name: "description", content: "Browse, search, filter and sort the analysed review dataset, or upload your own CSV." },
      { property: "og:title", content: "Dataset — Sentiment Analysis Tool" },
      { property: "og:description", content: "Explore 120 analysed customer reviews or upload your own CSV for instant analysis." },
    ],
  }),
  component: DatasetPage,
});

type Sort = "date-desc" | "date-asc" | "score-desc" | "score-asc" | "conf-desc";
const PAGE = 15;

function csvEscape(v: string | number) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function download(name: string, content: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function DatasetPage() {
  const { records, addUploaded, removeRecord, reset, includeSample } = useCorpus();
  const [q, setQ] = useState("");
  const [label, setLabel] = useState("all");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<Sort>("date-desc");
  const [page, setPage] = useState(1);
  const [replace, setReplace] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => [...new Set(records.map((r) => r.category))].sort(), [records]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = records.filter(
      (r) =>
        (label === "all" || r.result.label === label) &&
        (cat === "all" || r.category === cat) &&
        (!needle || r.text.toLowerCase().includes(needle) || r.id.toLowerCase().includes(needle)),
    );
    const cmp: Record<Sort, (a: (typeof out)[0], b: (typeof out)[0]) => number> = {
      "date-desc": (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
      "date-asc": (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
      "score-desc": (a, b) => b.result.score - a.result.score,
      "score-asc": (a, b) => a.result.score - b.result.score,
      "conf-desc": (a, b) => b.result.confidence - a.result.confidence,
    };
    return out.sort(cmp[sort]);
  }, [records, q, label, cat, sort]);

  const s = useMemo(() => summarize(filtered), [filtered]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * PAGE, cur * PAGE);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setUploadError(null);
    if (!/\.csv$/i.test(f.name)) {
      setUploadError("Please choose a .csv file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setUploadError("File is larger than 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const { rows, textColumn, truncated } = extractRows(await f.text());
      const n = addUploaded(rows, replace);
      toast.success(`Analysed ${n} texts from column “${textColumn}”${truncated ? " (first 2000 rows)" : ""}.`);
      setPage(1);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Could not read the file.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const exportCsv = () => {
    const lines = [["id", "date", "category", "text", "sentiment", "score", "confidence"].join(",")];
    filtered.forEach((r) => lines.push([r.id, r.date, r.category, r.text, r.result.label, r.result.score, r.result.confidence].map(csvEscape).join(",")));
    download("sentiment-results.csv", lines.join("\n"));
  };

  const resetFilters = () => {
    setQ("");
    setLabel("all");
    setCat("all");
    setPage(1);
  };

  return (
    <>
      <PageHeader
        eyebrow="Data · Corpus"
        title="Dataset Analysis"
        description={`${records.length} records${includeSample ? " including the built-in sample of 120 customer reviews" : ""}. Every record is classified by the same NLP engine.`}
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="h-4 w-4" /> Export results
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" eyebrow="Upload" title="Analyse your own CSV">
          <p className="text-sm text-muted-foreground">
            The file needs a header row. A column named <code className="font-mono">text</code>, <code className="font-mono">review</code> or <code className="font-mono">comment</code> is used
            automatically (otherwise the longest column). Optional <code className="font-mono">date</code> (YYYY-MM-DD) and <code className="font-mono">category</code> columns are also read.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} aria-label="CSV file" />
            <Button onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="h-4 w-4" /> {busy ? "Analysing…" : "Upload CSV"}
            </Button>
            <div className="flex items-center gap-2">
              <Switch id="replace" checked={replace} onCheckedChange={setReplace} />
              <Label htmlFor="replace" className="text-sm">Replace current data</Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => download("example-reviews.csv", "date,category,text\n2026-07-01,Delivery,\"Fast delivery, very happy!\"\n2026-07-02,Pricing,Too expensive for what you get.\n2026-07-03,Customer Service,The agent answered my email.\n")}
            >
              <Download className="h-4 w-4" /> Example CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { reset(); setPage(1); toast("Dataset restored to the original sample."); }}>
              <RotateCcw className="h-4 w-4" /> Restore sample
            </Button>
          </div>
          {uploadError && <p className="mt-3 text-sm text-destructive" role="alert">{uploadError}</p>}
        </Card>
        <Card eyebrow="Current selection" title={`${filtered.length} records`}>
          <CountBar s={s} />
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search reviews or IDs…" className="pl-9" aria-label="Search reviews" />
          </div>
          <Select value={label} onValueChange={(v) => { setLabel(v); setPage(1); }}>
            <SelectTrigger className="md:w-40" aria-label="Filter by sentiment"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sentiments</SelectItem>
              <SelectItem value="Positive">Positive</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
              <SelectItem value="Negative">Negative</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={(v) => { setCat(v); setPage(1); }}>
            <SelectTrigger className="md:w-48" aria-label="Filter by category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="md:w-44" aria-label="Sort"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="score-desc">Most positive</SelectItem>
              <SelectItem value="score-asc">Most negative</SelectItem>
              <SelectItem value="conf-desc">Highest confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No records match your filters">
            <Button variant="outline" size="sm" className="mt-2" onClick={resetFilters}>Clear filters</Button>
          </EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    {["ID", "Date", "Review", "Category", "Sentiment", "Score", "Conf.", ""].map((h) => (
                      <th key={h} className="eyebrow whitespace-nowrap px-2 py-2 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-border/60 align-top hover:bg-muted/50">
                      <td className="tabular whitespace-nowrap px-2 py-3 text-xs text-muted-foreground">{r.id}</td>
                      <td className="tabular whitespace-nowrap px-2 py-3 text-xs">{r.date}</td>
                      <td className="min-w-64 px-2 py-3">{r.text}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-xs text-muted-foreground">{r.category}</td>
                      <td className="px-2 py-3"><SentimentBadge label={r.result.label} /></td>
                      <td className="px-2 py-3"><ScoreText score={r.result.score} /></td>
                      <td className="tabular px-2 py-3 text-xs">{r.result.confidence}%</td>
                      <td className="px-2 py-3">
                        {r.source !== "sample" && (
                          <button onClick={() => removeRecord(r.id)} className="text-muted-foreground hover:text-destructive" aria-label={`Delete ${r.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span className="tabular">
                {(cur - 1) * PAGE + 1}–{Math.min(cur * PAGE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setPage(cur - 1)} disabled={cur <= 1} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="tabular">{cur} / {pages}</span>
                <Button variant="outline" size="icon" onClick={() => setPage(cur + 1)} disabled={cur >= pages} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </>
  );
}

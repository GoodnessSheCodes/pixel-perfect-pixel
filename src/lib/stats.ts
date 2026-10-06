import { STOPWORDS, type AnalysisResult, type SentimentLabel } from "./sentiment";

export interface AnalyzedRecord {
  id: string;
  date: string;
  text: string;
  category: string;
  source: "sample" | "upload" | "manual";
  result: AnalysisResult;
}

export const LABELS: SentimentLabel[] = ["Positive", "Neutral", "Negative"];

/** Largest-remainder rounding so percentages always total exactly 100. */
export function percentages(counts: number[], decimals = 1): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return counts.map(() => 0);
  const f = 10 ** decimals;
  const target = 100 * f;
  const raw = counts.map((c) => (c / total) * target);
  const floored = raw.map(Math.floor);
  let rem = target - floored.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (rem <= 0) break;
    floored[i] = floored[i]! + 1;
    rem--;
  }
  return floored.map((v) => v / f);
}

export function summarize(records: AnalyzedRecord[]) {
  const counts = LABELS.map((l) => records.filter((r) => r.result.label === l).length);
  const pct = percentages(counts);
  const avg = records.length ? records.reduce((a, r) => a + r.result.score, 0) / records.length : 0;
  const avgConfidence = records.length ? records.reduce((a, r) => a + r.result.confidence, 0) / records.length : 0;
  return {
    total: records.length,
    positive: counts[0]!,
    neutral: counts[1]!,
    negative: counts[2]!,
    pctPositive: pct[0]!,
    pctNeutral: pct[1]!,
    pctNegative: pct[2]!,
    avgScore: Math.round(avg * 100) / 100,
    avgConfidence: Math.round(avgConfidence),
  };
}
export type Summary = ReturnType<typeof summarize>;

/** Sentiment-bearing words that drove the polarity, weighted by frequency. */
export function topSentimentWords(records: AnalyzedRecord[], polarity: "pos" | "neg", limit = 8) {
  const map = new Map<string, number>();
  for (const r of records) {
    for (const h of r.result.hits) {
      if (polarity === "pos" ? h.value > 0 : h.value < 0) {
        const key = h.negated ? h.phrase : h.word;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/** Content (topic) words in texts of a given label, excluding sentiment words. */
export function topThemes(records: AnalyzedRecord[], label: SentimentLabel, limit = 6) {
  const map = new Map<string, number>();
  for (const r of records.filter((x) => x.result.label === label)) {
    const sentimentWords = new Set(r.result.hits.map((h) => h.word));
    const seen = new Set<string>();
    for (const w of r.text.toLowerCase().replace(/[’']/g, "").split(/[^a-z]+/)) {
      if (w.length < 4 || STOPWORDS.has(w) || sentimentWords.has(w) || seen.has(w)) continue;
      seen.add(w);
      map.set(w, (map.get(w) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export function byMonth(records: AnalyzedRecord[]) {
  const map = new Map<string, AnalyzedRecord[]>();
  for (const r of records) {
    const k = r.date.slice(0, 7);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, rs]) => {
      const s = summarize(rs);
      const d = new Date(month + "-01T00:00:00Z");
      return {
        month,
        label: d.toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" }),
        Positive: s.positive,
        Neutral: s.neutral,
        Negative: s.negative,
        avgScore: s.avgScore,
        total: s.total,
        pctPositive: s.pctPositive,
        pctNegative: s.pctNegative,
      };
    });
}

export function byCategory(records: AnalyzedRecord[]) {
  const map = new Map<string, AnalyzedRecord[]>();
  for (const r of records) {
    if (!map.has(r.category)) map.set(r.category, []);
    map.get(r.category)!.push(r);
  }
  return [...map.entries()]
    .map(([category, rs]) => {
      const s = summarize(rs);
      return { category, Positive: s.positive, Neutral: s.neutral, Negative: s.negative, avgScore: s.avgScore, total: s.total, pctPositive: s.pctPositive, pctNegative: s.pctNegative };
    })
    .sort((a, b) => b.total - a.total);
}

export function fmtScore(n: number) {
  return `${n > 0 ? "+" : n < 0 ? "−" : "±"}${Math.abs(n).toFixed(2)}`;
}

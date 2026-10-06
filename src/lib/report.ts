import { byCategory, byMonth, fmtScore, summarize, topSentimentWords, topThemes, type AnalyzedRecord } from "./stats";

export interface ReportSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const q = (xs: { word: string }[]) => xs.map((x) => `“${x.word}”`);

export function generateReport(records: AnalyzedRecord[]): ReportSection[] {
  const s = summarize(records);
  if (s.total === 0) return [];
  const cats = byCategory(records);
  const months = byMonth(records);
  const posWords = topSentimentWords(records, "pos", 6);
  const negWords = topSentimentWords(records, "neg", 6);
  const posThemes = topThemes(records, "Positive", 5);
  const negThemes = topThemes(records, "Negative", 5);
  const neuThemes = topThemes(records, "Neutral", 5);
  const dominant = [
    ["positive", s.positive],
    ["neutral", s.neutral],
    ["negative", s.negative],
  ].sort((a, b) => (b[1] as number) - (a[1] as number))[0][0] as string;
  const tone = s.avgScore >= 0.1 ? "moderately positive" : s.avgScore <= -0.1 ? "moderately negative" : "broadly balanced";
  const tone2 = s.avgScore >= 0.35 ? "clearly positive" : s.avgScore <= -0.35 ? "clearly negative" : tone;
  const best = [...cats].sort((a, b) => b.avgScore - a.avgScore)[0];
  const worst = [...cats].sort((a, b) => a.avgScore - b.avgScore)[0];
  const mostNeg = [...cats].sort((a, b) => b.pctNegative - a.pctNegative)[0];
  const ratio = s.negative ? (s.positive / s.negative).toFixed(2) : "∞";

  const sections: ReportSection[] = [];

  sections.push({
    title: "Executive Summary",
    paragraphs: [
      `This report summarises an automated sentiment analysis of ${s.total} text records. Using a lexicon-based natural language processing approach, each record was classified as Positive, Neutral or Negative and assigned a compound score between −1 and +1.`,
      `Overall sentiment is ${tone2}, with a mean compound score of ${fmtScore(s.avgScore)}. ${s.pctPositive}% of texts were positive, ${s.pctNeutral}% neutral and ${s.pctNegative}% negative, giving a positive-to-negative ratio of ${ratio}. The most dominant class is ${dominant} sentiment.`,
    ],
  });

  const findings: string[] = [
    `${s.positive} of ${s.total} texts (${s.pctPositive}%) express positive sentiment, while ${s.negative} (${s.pctNegative}%) express negative sentiment.`,
  ];
  if (cats.length > 1) {
    findings.push(`${best.category} is the strongest area (mean score ${fmtScore(best.avgScore)}, n = ${best.total}).`);
    findings.push(`${worst.category} is the weakest area (mean score ${fmtScore(worst.avgScore)}, n = ${worst.total}).`);
    if (mostNeg.category !== worst.category) findings.push(`${mostNeg.category} has the highest share of negative texts (${mostNeg.pctNegative}%).`);
  }
  if (posWords.length) findings.push(`The most frequent positive descriptors are ${list(q(posWords.slice(0, 4)))}.`);
  if (negWords.length) findings.push(`The most frequent negative descriptors are ${list(q(negWords.slice(0, 4)))}.`);
  findings.push(`The classifier's average confidence across the corpus is ${s.avgConfidence}%.`);
  sections.push({ title: "Key Findings", paragraphs: ["The analysis surfaced the following patterns:"], bullets: findings });

  sections.push({
    title: "Sentiment Distribution",
    paragraphs: [
      `The corpus splits into ${s.positive} positive (${s.pctPositive}%), ${s.neutral} neutral (${s.pctNeutral}%) and ${s.negative} negative (${s.pctNegative}%) records; these proportions sum to 100%.`,
      s.pctNeutral < 20
        ? `The relatively small neutral share indicates that most authors expressed a clear opinion rather than purely factual statements.`
        : `A considerable neutral share suggests that many texts are informational or contain mixed signals that cancel each other out.`,
    ],
    bullets: cats.length > 1 ? cats.map((c) => `${c.category}: ${c.pctPositive}% positive, ${c.pctNegative}% negative (mean ${fmtScore(c.avgScore)}, n = ${c.total})`) : undefined,
  });

  const topPos = [...records].filter((r) => r.result.label === "Positive").sort((a, b) => b.result.score - a.result.score)[0];
  sections.push({
    title: "Positive Sentiment Analysis",
    paragraphs: s.positive
      ? [
          `Positive texts are characterised by words such as ${list(q(posWords))}. ${posThemes.length ? `Recurring topics in these texts include ${list(q(posThemes))}, suggesting these are the aspects users value most.` : ""}`,
          topPos ? `A representative highly positive example (score ${fmtScore(topPos.result.score)}) reads: “${topPos.text}”` : "",
        ].filter(Boolean)
      : ["No positive texts were identified in the current dataset."],
  });

  const topNeg = [...records].filter((r) => r.result.label === "Negative").sort((a, b) => a.result.score - b.result.score)[0];
  sections.push({
    title: "Negative Sentiment Analysis",
    paragraphs: s.negative
      ? [
          `Complaints are typically expressed through words such as ${list(q(negWords))}. ${negThemes.length ? `The recurring topics in negative texts are ${list(q(negThemes))}, which point to the main sources of dissatisfaction.` : ""}`,
          cats.length > 1 ? `Negative sentiment is most concentrated in ${mostNeg.category}, where ${mostNeg.pctNegative}% of texts are negative.` : "",
          topNeg ? `The most negative example (score ${fmtScore(topNeg.result.score)}) reads: “${topNeg.text}”` : "",
        ].filter(Boolean)
      : ["No negative texts were identified in the current dataset."],
  });

  sections.push({
    title: "Neutral Sentiment Analysis",
    paragraphs: s.neutral
      ? [
          `Neutral texts (${s.pctNeutral}%) mostly contain factual, descriptive information — for example specifications, prices, procedures or delivery details — with few or no opinion words. ${neuThemes.length ? `Typical topics include ${list(q(neuThemes))}.` : ""}`,
          `Some neutral classifications arise from mixed texts in which positive and negative statements offset each other; these may warrant manual review.`,
        ]
      : ["No neutral texts were identified in the current dataset."],
  });

  if (months.length >= 2) {
    const first = months[0];
    const last = months[months.length - 1];
    const diff = Math.round((last.avgScore - first.avgScore) * 100) / 100;
    const peak = [...months].sort((a, b) => b.avgScore - a.avgScore)[0];
    const low = [...months].sort((a, b) => a.avgScore - b.avgScore)[0];
    sections.push({
      title: "Trends",
      paragraphs: [
        `Records span ${months.length} months (${first.label} – ${last.label}). The mean monthly score moved from ${fmtScore(first.avgScore)} to ${fmtScore(last.avgScore)}, a change of ${fmtScore(diff)}, which indicates ${Math.abs(diff) < 0.1 ? "a broadly stable sentiment over time" : diff > 0 ? "an improving trend" : "a deteriorating trend"}.`,
        `Sentiment peaked in ${peak.label} (${fmtScore(peak.avgScore)}, n = ${peak.total}) and was lowest in ${low.label} (${fmtScore(low.avgScore)}, n = ${low.total}). Monthly sample sizes are modest, so short-term fluctuations should be interpreted with caution.`,
      ],
    });
  } else {
    sections.push({ title: "Trends", paragraphs: ["All records fall within a single month, so no time-based trend can be determined."] });
  }

  const recs: string[] = [];
  if (cats.length > 1 && worst.avgScore < 0.2) recs.push(`Prioritise improvements in ${worst.category}, the lowest-scoring area, and track its score monthly.`);
  const negSet = new Set(negWords.map((w) => w.word).concat(negThemes.map((w) => w.word)));
  if (["late", "delayed", "delay", "delivery", "parcel", "courier"].some((w) => negSet.has(w))) recs.push("Improve delivery reliability and proactive tracking updates to reduce lateness complaints.");
  if (["rude", "ignored", "unhelpful", "nobody", "support"].some((w) => negSet.has(w))) recs.push("Invest in customer-service training and set response-time targets for support channels.");
  if (["expensive", "overpriced", "overcharged", "charged", "price"].some((w) => negSet.has(w))) recs.push("Review pricing transparency, including hidden fees and renewal notifications.");
  if (["crash", "crashes", "buggy", "freezes", "confusing", "slow", "laggy"].some((w) => negSet.has(w))) recs.push("Allocate resources to app stability and usability testing on lower-end devices.");
  if (["broke", "broken", "flimsy", "damaged", "faulty", "defective"].some((w) => negSet.has(w))) recs.push("Strengthen quality control and packaging to reduce damaged or defective items.");
  if (cats.length > 1) recs.push(`Use practices from ${best.category} — the best-performing area — as an internal benchmark.`);
  recs.push("Manually review low-confidence and neutral classifications to validate the automated results.");
  recs.push("Collect a larger and more recent sample to confirm the observed trends.");
  sections.push({ title: "Recommendations", paragraphs: ["Based on the findings, the following actions are recommended:"], bullets: recs });

  sections.push({
    title: "Conclusion",
    paragraphs: [
      `The analysis of ${s.total} texts shows ${tone2} sentiment overall (${fmtScore(s.avgScore)}), with ${s.pctPositive}% positive and ${s.pctNegative}% negative responses.${cats.length > 1 ? ` ${best.category} emerges as a strength and ${worst.category} as the principal area for improvement.` : ""} Lexicon-based sentiment analysis offers a transparent and efficient way to turn unstructured text into measurable insight; however, because it may misinterpret sarcasm, slang and context, its results should complement rather than replace human judgement.`,
    ],
  });

  return sections;
}

export function reportToText(sections: ReportSection[], generatedAt: string) {
  const out = [`SENTIMENT ANALYSIS — INSIGHTS REPORT`, `Generated ${generatedAt}`, ""];
  sections.forEach((sec, i) => {
    out.push(`${i + 1}. ${sec.title.toUpperCase()}`, "");
    sec.paragraphs.forEach((p) => out.push(p, ""));
    sec.bullets?.forEach((b) => out.push(`  • ${b}`));
    if (sec.bullets) out.push("");
  });
  return out.join("\n");
}

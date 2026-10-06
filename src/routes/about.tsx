import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Disclaimer, Workflow } from "@/components/notes";
import { Card, SentimentBadge } from "@/components/sentiment-ui";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Methodology — Sentiment Analysis Tool" },
      { name: "description", content: "How the lexicon-based NLP sentiment model works, how scores are calculated, and its limitations." },
      { property: "og:title", content: "About & Methodology — Sentiment Analysis Tool" },
      { property: "og:description", content: "Transparent methodology for Positive, Neutral and Negative sentiment classification." },
    ],
  }),
  component: About,
});

const OUTCOMES = [
  ["Data collection", "120 realistic customer reviews across five categories, plus CSV upload and manual input."],
  ["Data preprocessing", "Lower-casing, punctuation removal, apostrophe folding, tokenisation and sentence segmentation."],
  ["Natural Language Processing", "Lexicon lookup with negation, intensifier, contrast and phrase handling."],
  ["Sentiment classification", "Compound score thresholded into Positive, Neutral or Negative with a confidence estimate."],
  ["Data visualization", "Donut, bar, stacked, line and keyword charts that update with the data."],
  ["Interpretation & insights", "An automatically generated report with themes, trends and recommendations."],
];

function About() {
  return (
    <>
      <PageHeader eyebrow="Documentation" title="About / Methodology" description="A transparent account of how this tool turns unstructured text into measurable sentiment." />

      <div className="mb-6 paper-card p-5"><div className="eyebrow mb-3">Workflow</div><Workflow /></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card eyebrow="1" title="What is sentiment analysis?">
          <p className="text-sm leading-relaxed">
            Sentiment analysis (or opinion mining) is a branch of natural language processing that identifies the emotional polarity expressed in text. Organisations use it to
            measure how customers, users or the public feel about products, services and events at a scale that manual reading cannot match.
          </p>
        </Card>
        <Card eyebrow="2" title="How the application works">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
            <li><strong>Preprocessing</strong> — text is lower-cased, cleaned of punctuation and split into tokens and sentences.</li>
            <li><strong>Lexicon lookup</strong> — each token and multi-word phrase is matched against a lexicon of ~350 weighted terms (−3 to +3).</li>
            <li><strong>Rules</strong> — negators within three words flip and dampen polarity (×−0.74); intensifiers boost and diminishers soften; after “but” weight ×1.5, before ×0.5; “!” adds emphasis.</li>
            <li><strong>Classification</strong> — the normalised compound score is mapped to a label and confidence.</li>
            <li><strong>Aggregation</strong> — results feed the dashboard, charts and Insights Report.</li>
          </ol>
        </Card>
        <Card eyebrow="3" title="What the labels mean">
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><SentimentBadge label="Positive" /><span>Compound score ≥ +0.10 — approval, satisfaction or praise.</span></li>
            <li className="flex gap-3"><SentimentBadge label="Neutral" /><span>Between −0.10 and +0.10 — factual, informational, or balanced/mixed text.</span></li>
            <li className="flex gap-3"><SentimentBadge label="Negative" /><span>Compound score ≤ −0.10 — complaints, frustration or criticism.</span></li>
          </ul>
        </Card>
        <Card eyebrow="4" title="How scores are calculated">
          <p className="text-sm leading-relaxed">The adjusted word weights are summed (S) and normalised into the range −1…+1:</p>
          <p className="my-3 rounded-md bg-muted p-3 text-center font-mono text-sm">compound = S / √(S² + 15)</p>
          <p className="text-sm leading-relaxed">
            Confidence (35–99%) combines the magnitude of the compound score with the agreement between positive and negative signals; for neutral texts it reflects how
            close the score is to zero. Dataset percentages use largest-remainder rounding so they always sum to exactly 100%.
          </p>
        </Card>
        <Card eyebrow="5" title="Limitations">
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li>Sarcasm and irony (“Great, it broke again”) are often misread.</li>
            <li>Slang, emojis, misspellings and non-English text are poorly covered by the lexicon.</li>
            <li>Context and domain meaning (“cheap” as good value vs. low quality) are not modelled.</li>
            <li>Bag-of-words methods ignore deeper syntax; transformer models may be more accurate but are less transparent.</li>
            <li>The sample dataset is illustrative and small, limiting statistical generalisation.</li>
          </ul>
        </Card>
        <Card eyebrow="6" title="Real-world applications">
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li>Customer review and product feedback monitoring</li>
            <li>Brand and social-media reputation tracking</li>
            <li>Customer-support ticket triage and escalation</li>
            <li>Employee and student survey analysis</li>
            <li>Market research and political opinion analysis</li>
          </ul>
        </Card>
      </div>

      <Card className="mt-6" eyebrow="Academic presentation" title="Learning outcomes demonstrated">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOMES.map(([t, d], i) => (
            <div key={t} className="rounded-lg border border-border p-4">
              <dt className="font-medium"><span className="tabular mr-2 text-muted-foreground">0{i + 1}</span>{t}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="mt-6"><Disclaimer /></div>
    </>
  );
}

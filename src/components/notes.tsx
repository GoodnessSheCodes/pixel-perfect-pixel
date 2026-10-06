import { AlertTriangle } from "lucide-react";

export const WORKFLOW = ["Raw Text", "Preprocessing", "Sentiment Analysis", "Classification", "Visualization", "Insights"];

export function Workflow() {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {WORKFLOW.map((w, i) => (
        <li key={w} className="flex items-center gap-2">
          <span className="rounded-md border border-border bg-card px-2.5 py-1 font-mono">
            <span className="text-muted-foreground">{i + 1}.</span> {w}
          </span>
          {i < WORKFLOW.length - 1 && <span className="text-muted-foreground" aria-hidden>→</span>}
        </li>
      ))}
    </ol>
  );
}

export function Disclaimer() {
  return (
    <div className="flex gap-3 rounded-lg border border-highlight/50 bg-accent p-4 text-sm text-accent-foreground">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        <strong>Academic disclaimer:</strong> automated sentiment analysis is an approximation. It can misclassify sarcasm, irony, slang, domain-specific language,
        context-dependent statements and ambiguous text. Results should be interpreted alongside human judgement.
      </p>
    </div>
  );
}

export function AppShellNote() {
  return <p className="mt-6 text-xs text-muted-foreground">Values recompute automatically whenever the dataset changes.</p>;
}

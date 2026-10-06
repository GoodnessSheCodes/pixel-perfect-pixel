import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { analyzeText } from "./sentiment";
import { buildSampleDataset } from "./sample-data";
import type { AnalyzedRecord } from "./stats";

const SAMPLE: AnalyzedRecord[] = buildSampleDataset().map((r) => ({ ...r, source: "sample", result: analyzeText(r.text) }));
const KEY = "sat-corpus-v1";

interface Persisted {
  includeSample: boolean;
  extra: { id: string; date: string; text: string; category: string; source: "upload" | "manual" }[];
}

interface Ctx {
  records: AnalyzedRecord[];
  includeSample: boolean;
  sampleCount: number;
  addManual: (text: string) => AnalyzedRecord;
  addUploaded: (rows: { text: string; date?: string; category?: string }[], replace: boolean) => number;
  removeRecord: (id: string) => void;
  reset: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function CorpusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>({ includeSample: true, extra: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);

  const extraAnalyzed = useMemo(
    () => state.extra.map((r) => ({ ...r, result: analyzeText(r.text) }) as AnalyzedRecord),
    [state.extra],
  );

  const records = useMemo(
    () => [...(state.includeSample ? SAMPLE : []), ...extraAnalyzed].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)),
    [state.includeSample, extraAnalyzed],
  );

  const addManual = useCallback((text: string) => {
    const rec = {
      id: `M-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString().slice(0, 10),
      text,
      category: "Manual Entry",
      source: "manual" as const,
    };
    setState((s) => ({ ...s, extra: [...s.extra, rec] }));
    return { ...rec, result: analyzeText(text) };
  }, []);

  const addUploaded = useCallback((rows: { text: string; date?: string; category?: string }[], replace: boolean) => {
    const today = new Date().toISOString().slice(0, 10);
    const stamp = Date.now().toString(36).toUpperCase();
    const recs = rows.map((r, i) => ({
      id: `U-${stamp}-${i + 1}`,
      date: r.date && /^\d{4}-\d{2}-\d{2}/.test(r.date) ? r.date.slice(0, 10) : today,
      text: r.text,
      category: r.category?.trim() || "Uploaded",
      source: "upload" as const,
    }));
    setState((s) => ({
      includeSample: replace ? false : s.includeSample,
      extra: replace ? recs : [...s.extra, ...recs],
    }));
    return recs.length;
  }, []);

  const removeRecord = useCallback((id: string) => {
    setState((s) => ({ ...s, extra: s.extra.filter((r) => r.id !== id) }));
  }, []);

  const reset = useCallback(() => setState({ includeSample: true, extra: [] }), []);

  return (
    <StoreCtx.Provider value={{ records, includeSample: state.includeSample, sampleCount: SAMPLE.length, addManual, addUploaded, removeRecord, reset }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useCorpus() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useCorpus must be used inside CorpusProvider");
  return c;
}

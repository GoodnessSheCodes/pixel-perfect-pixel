/**
 * Lexicon-based sentiment analyser (inspired by VADER / AFINN).
 * Pipeline: raw text -> preprocessing (lowercase, tokenise) -> lexicon lookup
 * with negation, intensifier and contrast ("but") handling -> normalised
 * compound score in [-1, 1] -> classification -> confidence.
 */

export type SentimentLabel = "Positive" | "Neutral" | "Negative";

export interface TokenHit {
  word: string;
  phrase: string;
  value: number;
  negated: boolean;
}

export interface AnalysisResult {
  label: SentimentLabel;
  score: number; // compound, -1..1
  confidence: number; // 0..100
  hits: TokenHit[];
  keywords: string[];
  tokenCount: number;
  explanation: string;
}

export const THRESHOLD = 0.1;

// prettier-ignore
const LEXICON: Record<string, number> = {
  // positive
  love: 3, loved: 3, loves: 3, adore: 3, amazing: 3, awesome: 3, excellent: 3, outstanding: 3, perfect: 3, fantastic: 3,
  superb: 3, brilliant: 3, wonderful: 3, incredible: 3, flawless: 3, exceptional: 3, delighted: 3, best: 3, phenomenal: 3,
  great: 2.5, impressed: 2.5, impressive: 2.5, happy: 2.5, pleased: 2, beautiful: 2.5, gorgeous: 2.5, excited: 2,
  good: 2, nice: 1.8, solid: 1.5, reliable: 2, sturdy: 1.8, durable: 2, helpful: 2, friendly: 2, polite: 1.5, kind: 1.5,
  fast: 1.5, quick: 1.5, quickly: 1.3, prompt: 1.5, promptly: 1.5, smooth: 1.8, easy: 1.5, intuitive: 2, simple: 1, clean: 1.2,
  recommend: 2, recommended: 2, worth: 1.5, value: 1, affordable: 1.8, bargain: 2, cheap: 0.5, generous: 2, fair: 1.2, reasonable: 1.2,
  comfortable: 1.8, convenient: 1.5, efficient: 1.8, professional: 1.8, responsive: 1.5, satisfied: 2, satisfying: 2, enjoy: 2, enjoyed: 2,
  thanks: 1.5, thank: 1.5, thankful: 2, grateful: 2, appreciate: 2, appreciated: 2, premium: 1.5, quality: 0.5, well: 0.8, works: 0.8,
  exceeded: 2.5, beyond: 0.5, lovely: 2.5, fun: 1.8, useful: 1.8, handy: 1.5, effortless: 2.2, seamless: 2.2, elegant: 2,
  accurate: 1.5, careful: 1.2, carefully: 1.2, safe: 1, safely: 1, secure: 1.2, resolved: 1.8, fixed: 1.2, sorted: 1.2, patient: 1.8,
  knowledgeable: 2, courteous: 2, attentive: 2, refund: 0, refunded: 1, early: 1.2, ontime: 1.5, intact: 1.2, fresh: 1.2,
  favourite: 2.5, favorite: 2.5, pleasant: 2, positive: 1.8, improved: 1.5, improvement: 1.2, upgrade: 1, delight: 2.5,
  stylish: 1.8, lightweight: 1, crisp: 1.5, bright: 1, vibrant: 1.8, powerful: 1.8, loyal: 1.8, wow: 2.5, yes: 0.5,
  // negative
  hate: -3, hated: -3, terrible: -3, awful: -3, horrible: -3, worst: -3, useless: -3, disgusting: -3, pathetic: -3, scam: -3,
  appalling: -3, unacceptable: -3, furious: -3, garbage: -3, rubbish: -2.5, nightmare: -3, ruined: -2.5, broken: -2.5, broke: -2.2,
  bad: -2.5, poor: -2.2, poorly: -2.2, disappointing: -2.5, disappointed: -2.5, disappointment: -2.5, frustrating: -2.5, frustrated: -2.5,
  annoying: -2, annoyed: -2, angry: -2.5, upset: -2, rude: -2.5, unhelpful: -2.2, slow: -1.8, late: -1.8, delayed: -1.8, delay: -1.5, delays: -1.5,
  damaged: -2.3, defective: -2.5, faulty: -2.5, cracked: -2, missing: -1.8, lost: -1.8, wrong: -1.8, error: -1.5, errors: -1.5, bug: -1.5, bugs: -1.8,
  buggy: -2, crash: -2, crashes: -2.2, crashed: -2.2, freezes: -2, froze: -2, glitch: -1.5, glitchy: -1.8, confusing: -1.8, complicated: -1.5,
  clunky: -1.8, cluttered: -1.5, expensive: -1.5, overpriced: -2.3, pricey: -1.2, ripoff: -3, waste: -2.3, wasted: -2.3, cheaply: -1.8, flimsy: -2,
  flimsier: -2, fell: -1, fail: -2, failed: -2, fails: -2, failure: -2.3, problem: -1.5, problems: -1.7, issue: -1.2, issues: -1.4, complaint: -1.5,
  ignored: -2, ignore: -1.5, never: -0.5, unfortunately: -1.2, sadly: -1.2, sad: -1.8, worse: -2.2, lacking: -1.5, mediocre: -1.5, meh: -1,
  uncomfortable: -1.8, hidden: -1, unreliable: -2.2, refused: -1.8, cancel: -1, cancelled: -1.5, stuck: -1.5, hassle: -1.8, painful: -2,
  difficult: -1.5, hard: -0.8, regret: -2.3, avoid: -2, shoddy: -2.5, dirty: -1.8, scratched: -1.8, stained: -1.8, leaking: -2, leaked: -2,
  noisy: -1.5, unclear: -1.2, misleading: -2.3, overcharged: -2.5, charged: -0.5, worried: -1.5, careless: -2, carelessly: -2, dented: -2,
  incompetent: -2.8, unprofessional: -2.5, nobody: -0.8, impossible: -1.8, tiny: -0.5, bland: -1.2, dull: -1.2, laggy: -1.8, lag: -1.3,
  disappoint: -2.3, sluggish: -1.8, outdated: -1.3, inconvenient: -1.5, unusable: -2.8, mess: -2, messy: -1.8, smelled: -1, crushed: -2,
};

const PHRASES: Record<string, number> = {
  "waste of money": -3,
  "waste of time": -3,
  "value for money": 2,
  "on time": 1.5,
  "ahead of schedule": 2,
  "above and beyond": 3,
  "fell apart": -2.5,
  "stopped working": -2.5,
  "does the job": 1.2,
  "not worth": -2,
  "rip off": -3,
  "customer for life": 2.5,
  "highly recommend": 3,
  "five stars": 2.5,
  "one star": -2.5,
  "never again": -2.5,
  "no complaints": 2,
  "no issues": 1.8,
  "no problems": 1.8,
  "as expected": 0.3,
  "as described": 0.6,
};

const NEGATIONS = new Set([
  "not", "no", "never", "none", "nothing", "neither", "nor", "hardly", "barely", "without",
  "isnt", "wasnt", "arent", "werent", "dont", "doesnt", "didnt", "cant", "couldnt", "wont",
  "wouldnt", "shouldnt", "aint", "havent", "hasnt", "hadnt",
]);

const INTENSIFIERS: Record<string, number> = {
  very: 1.4, really: 1.35, extremely: 1.6, absolutely: 1.6, incredibly: 1.6, so: 1.3, super: 1.4, totally: 1.4,
  completely: 1.5, highly: 1.4, truly: 1.35, utterly: 1.6, too: 1.2, most: 1.3, especially: 1.25, genuinely: 1.3,
};
const DIMINISHERS: Record<string, number> = {
  slightly: 0.6, somewhat: 0.65, kinda: 0.65, fairly: 0.75, quite: 0.85, little: 0.7, bit: 0.7, mostly: 0.8, okay: 1, almost: 0.7,
};

export const STOPWORDS = new Set(
  "a an the and or but if then so of to in on at for from by with as is are was were be been being it its this that these those i me my we our you your he she they them their his her us am do does did have has had will would can could should may might must just also than very really too there here what which who when where why how all any some more most other such only own same into about over under again further once out up down off both each few nor not no yes s t don now get got go went one two its im ive id ill thats theyre youre item order product bought use used make made even still much many thing things way day days time week weeks got"
    .split(" "),
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s!?]/g, " ")
    .replace(/([!?])/g, " $1 ")
    .split(/\s+/)
    .filter(Boolean);
}

function normalize(sum: number, alpha = 15) {
  return sum / Math.sqrt(sum * sum + alpha);
}

export function analyzeText(text: string): AnalysisResult {
  const tokens = tokenize(text);
  const words = tokens.filter((t) => t !== "!" && t !== "?");
  const exclaims = Math.min(tokens.filter((t) => t === "!").length, 3);
  const hits: TokenHit[] = [];
  const contributions: number[] = [];
  const butIndex = words.lastIndexOf("but");

  const consumed = new Set<number>();
  // phrase pass
  for (let i = 0; i < words.length; i++) {
    for (const [phrase, val] of Object.entries(PHRASES)) {
      const parts = phrase.split(" ");
      if (parts.every((p, k) => words[i + k] === p)) {
        parts.forEach((_, k) => consumed.add(i + k));
        let v = val;
        if (butIndex >= 0) v *= i < butIndex ? 0.5 : 1.5;
        hits.push({ word: phrase, phrase, value: v, negated: false });
        contributions.push(v);
      }
    }
  }

  for (let i = 0; i < words.length; i++) {
    if (consumed.has(i)) continue;
    const w = words[i];
    const base = LEXICON[w];
    if (base === undefined || base === 0) continue;
    let v = base;
    let negated = false;
    const prev = words.slice(Math.max(0, i - 3), i);
    // intensifier / diminisher directly before
    const p1 = words[i - 1];
    if (p1 && INTENSIFIERS[p1]) v *= INTENSIFIERS[p1];
    if (p1 && DIMINISHERS[p1]) v *= DIMINISHERS[p1];
    if (prev.some((p) => NEGATIONS.has(p))) {
      v *= -0.74;
      negated = true;
    }
    if (butIndex >= 0) v *= i < butIndex ? 0.5 : 1.5;
    const phrase = (negated ? prev.join(" ") + " " : p1 && (INTENSIFIERS[p1] || DIMINISHERS[p1]) ? p1 + " " : "") + w;
    hits.push({ word: w, phrase: phrase.trim(), value: v, negated });
    contributions.push(v);
  }

  let sum = contributions.reduce((a, b) => a + b, 0);
  if (sum !== 0 && exclaims) sum += Math.sign(sum) * exclaims * 0.29;
  const score = Math.round(normalize(sum) * 100) / 100;

  const label: SentimentLabel = score >= THRESHOLD ? "Positive" : score <= -THRESHOLD ? "Negative" : "Neutral";

  const pos = contributions.filter((c) => c > 0).reduce((a, b) => a + b, 0);
  const neg = Math.abs(contributions.filter((c) => c < 0).reduce((a, b) => a + b, 0));
  const total = pos + neg;
  let confidence: number;
  if (label === "Neutral") {
    const mixed = total > 0 ? 1 - Math.abs(pos - neg) / total : 1;
    confidence = 55 + 30 * (1 - Math.abs(score) / THRESHOLD) * (total === 0 ? 1 : 0.6 + 0.4 * mixed);
  } else {
    const agreement = total > 0 ? Math.max(pos, neg) / total : 0.5;
    confidence = 45 + 40 * Math.abs(score) + 14 * agreement;
  }
  confidence = Math.max(35, Math.min(99, Math.round(confidence)));

  const keywords = [...new Set(hits.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).map((h) => h.phrase))].slice(0, 8);

  return {
    label,
    score,
    confidence,
    hits,
    keywords,
    tokenCount: words.length,
    explanation: explain(label, score, hits, butIndex >= 0, exclaims),
  };
}

function explain(label: SentimentLabel, score: number, hits: TokenHit[], hasBut: boolean, exclaims: number) {
  const posHits = hits.filter((h) => h.value > 0);
  const negHits = hits.filter((h) => h.value < 0);
  const fmt = (arr: TokenHit[]) =>
    arr
      .slice(0, 4)
      .map((h) => `"${h.phrase}"`)
      .join(", ");
  const parts: string[] = [];
  if (hits.length === 0) {
    return "No sentiment-bearing words from the lexicon were detected, so the text is treated as factual or neutral in tone.";
  }
  if (label === "Positive") parts.push(`The text leans positive (compound score ${score >= 0 ? "+" : ""}${score.toFixed(2)}).`);
  if (label === "Negative") parts.push(`The text leans negative (compound score ${score.toFixed(2)}).`);
  if (label === "Neutral")
    parts.push(
      `The compound score (${score.toFixed(2)}) falls inside the neutral band of ±${THRESHOLD.toFixed(2)}, meaning positive and negative signals are weak or balance out.`,
    );
  if (posHits.length) parts.push(`Positive signals: ${fmt(posHits)}.`);
  if (negHits.length) parts.push(`Negative signals: ${fmt(negHits)}.`);
  const neg = hits.filter((h) => h.negated);
  if (neg.length) parts.push(`Negation reversed the polarity of ${fmt(neg)}.`);
  if (hasBut) parts.push(`A contrast word ("but") was found, so the clause after it was weighted more heavily.`);
  if (exclaims) parts.push(`Exclamation marks slightly amplified the overall intensity.`);
  return parts.join(" ");
}

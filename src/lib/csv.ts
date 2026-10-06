/** Minimal RFC-4180 CSV parser (handles quotes, escaped quotes, CRLF). */
export function parseCSV(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const s = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

const TEXT_NAMES = ["text", "review", "comment", "content", "feedback", "message", "body", "tweet", "review_text"];

export function extractRows(input: string) {
  const rows = parseCSV(input);
  if (rows.length < 2) throw new Error("The file needs a header row and at least one data row.");
  const header = rows[0].map((h) => h.trim().toLowerCase());
  let textIdx = header.findIndex((h) => TEXT_NAMES.includes(h));
  if (textIdx < 0) {
    // fall back to the column with the longest average content
    const avg = header.map((_, i) => rows.slice(1).reduce((a, r) => a + (r[i]?.length ?? 0), 0));
    textIdx = avg.indexOf(Math.max(...avg));
  }
  const dateIdx = header.findIndex((h) => ["date", "created_at", "timestamp", "time"].includes(h));
  const catIdx = header.findIndex((h) => ["category", "product", "topic", "type"].includes(h));
  const data = rows
    .slice(1)
    .map((r) => ({
      text: (r[textIdx] ?? "").trim(),
      date: dateIdx >= 0 ? r[dateIdx]?.trim() : undefined,
      category: catIdx >= 0 ? r[catIdx]?.trim() : undefined,
    }))
    .filter((r) => r.text.length > 0);
  if (!data.length) throw new Error("No text was found in the detected text column.");
  return { rows: data.slice(0, 2000), textColumn: rows[0][textIdx], truncated: data.length > 2000 };
}

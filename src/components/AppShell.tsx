import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BarChart3, BookOpen, Database, FileText, Menu, PenLine, X } from "lucide-react";
import { useCorpus } from "@/lib/store";

const NAV = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/analyze", label: "Analyze Text", icon: PenLine },
  { to: "/dataset", label: "Dataset", icon: Database },
  { to: "/report", label: "Insights Report", icon: FileText },
  { to: "/about", label: "About / Methodology", icon: BookOpen },
] as const;

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "!bg-sidebar-accent !text-sidebar-accent-foreground font-medium shadow-[inset_3px_0_0_var(--sidebar-primary)]" }}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-sidebar-primary font-serif text-lg font-semibold text-sidebar-primary-foreground">
        S
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-[15px] font-semibold text-sidebar-accent-foreground">Sentiment Analysis Tool</span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/60">NLP · Academic project</span>
      </span>
    </Link>
  );
}

function CorpusMeta() {
  const { records } = useCorpus();
  return (
    <div className="rounded-md border border-sidebar-border p-3 text-xs text-sidebar-foreground/70">
      <div className="font-mono uppercase tracking-[0.14em] text-[10px] text-sidebar-foreground/50">Active corpus</div>
      <div className="mt-1 tabular text-lg text-sidebar-accent-foreground">{records.length} texts</div>
      <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px]">
        Raw → Clean → Score → Class → Viz → Insight
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between bg-sidebar p-5 lg:flex">
        <div className="space-y-8">
          <Brand />
          <Nav />
        </div>
        <CorpusMeta />
      </aside>

      <header className="no-print sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 lg:hidden">
        <Brand />
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-md p-2 text-sidebar-accent-foreground hover:bg-sidebar-accent"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {open && (
        <div className="no-print fixed inset-x-0 top-[60px] z-20 space-y-4 bg-sidebar p-4 shadow-xl lg:hidden animate-rise">
          <Nav onNavigate={() => setOpen(false)} />
        </div>
      )}

      <main className="print-full lg:pl-64">
        <div className="print-full mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between animate-rise">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-2 text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

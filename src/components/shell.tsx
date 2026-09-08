import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { AuthSlot } from "@/components/auth-slot";
import { MannaWordmark } from "@/components/logo";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="manna-grain min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="shrink-0" aria-label="Manna home">
            <MannaWordmark />
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/about"
              className="hidden h-11 items-center px-3 text-sm text-muted hover:text-ink sm:inline-flex"
            >
              The story
            </Link>
            <Link
              to="/me"
              className="hidden h-11 items-center px-3 text-sm text-muted hover:text-ink sm:inline-flex"
            >
              My Manna
            </Link>
            <Link
              to="/give"
              className="inline-flex h-11 min-h-11 items-center gap-1.5 rounded-md bg-clay px-3.5 text-sm font-medium text-clay-fg hover:bg-clay/90"
            >
              <Plus className="size-4" />
              <span className="sm:hidden">Give</span>
              <span className="hidden sm:inline">Pass along</span>
            </Link>
            <AuthSlot />
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-border/80 px-4 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <MannaWordmark />
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Enough for today. Freely given. If it is here, it is free.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <Link to="/about" className="hover:text-ink">
              The story
            </Link>
            <Link to="/covenant" className="hover:text-ink">
              Covenant
            </Link>
            <Link to="/give" className="hover:text-ink">
              Pass along
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

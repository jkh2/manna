import { Link } from "@tanstack/react-router";

export type MatchPair = {
  askId: string;
  askTitle: string;
  offerId: string;
  offerTitle: string;
  reason: string;
  askPhoto?: string | null;
  offerPhoto?: string | null;
};

export function MatchStrip({ matches }: { matches: MatchPair[] }) {
  if (matches.length === 0) return null;
  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-clay">
        Someone needs something. Someone has extra.
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-tight">
        Matched nearby
      </h2>
      <p className="mt-1 text-sm text-muted">
        When a Give lands near an Ask, we ping both porches. The giver still chooses.
      </p>
      <ul className="mt-4 space-y-3">
        {matches.map((match) => (
          <li
            key={`${match.askId}-${match.offerId}`}
            className="grid gap-2 rounded-lg bg-sunken/60 p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"
          >
            <Link
              to="/listing/$id"
              params={{ id: match.askId }}
              className="min-w-0 hover:text-clay"
            >
              <p className="text-[10px] uppercase tracking-wider text-faint">Need</p>
              <p className="truncate font-medium">{match.askTitle}</p>
            </Link>
            <p className="hidden text-center text-xs text-faint sm:block">{match.reason}</p>
            <Link
              to="/listing/$id"
              params={{ id: match.offerId }}
              className="min-w-0 text-left hover:text-clay sm:text-right"
            >
              <p className="text-[10px] uppercase tracking-wider text-faint">Extra</p>
              <p className="truncate font-medium">{match.offerTitle}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

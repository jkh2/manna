import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { CauseSlot } from "@/components/cause-slot";
import { ListingCard } from "@/components/listing-card";
import { MatchStrip } from "@/components/match-strip";
import { PlacePicker } from "@/components/place-picker";
import { browseListings, getImpact, listMatches } from "@/lib/listings";
import { RADIUS_STEPS } from "@/lib/geo";
import { usePlaceStore } from "@/lib/place-store";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  KINDS,
  KIND_LABEL,
  type Category,
  type Kind,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { place, radiusMiles, setRadiusMiles } = usePlaceStore();
  const [kind, setKind] = useState<Kind | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [qLive, setQLive] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(qLive.trim()), 220);
    return () => window.clearTimeout(timer);
  }, [qLive]);

  const listingsQuery = useQuery({
    queryKey: ["listings", place.lat, place.lng, radiusMiles, kind, category, q],
    queryFn: () =>
      browseListings({
        data: {
          lat: place.lat,
          lng: place.lng,
          radiusMiles,
          kind,
          category,
          q: q || null,
        },
      }),
  });

  const impactQuery = useQuery({
    queryKey: ["impact"],
    queryFn: () => getImpact(),
  });

  const matchQuery = useQuery({
    queryKey: ["matches", place.lat, place.lng, radiusMiles],
    queryFn: () =>
      listMatches({
        data: { lat: place.lat, lng: place.lng, radiusMiles },
      }),
  });

  const listings = listingsQuery.data ?? [];
  const impact = impactQuery.data;
  const nationwide = radiusMiles >= 2500;
  const radiusLabel =
    RADIUS_STEPS.find((step) => step.miles === radiusMiles)?.label ?? "this area";
  const nextRadius = RADIUS_STEPS.find((step) => step.miles > radiusMiles);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8">
      <section className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-clay">
          Freely given
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
          Enough for today.
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          Free goods, food, and help from neighbors nearby. Nothing is for sale.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-faint">
            Looking for
          </span>
          <span className="mt-1.5 flex min-h-11 items-center gap-2 rounded-lg bg-sunken/80 px-3">
            <Search className="size-4 shrink-0 text-clay" />
            <input
              type="search"
              value={qLive}
              onChange={(event) => setQLive(event.target.value)}
              placeholder="Crib, coats, zucchini, a ride…"
              className="h-11 w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
              aria-label="Search listings"
            />
          </span>
        </label>
        <div className="mt-4">
          <PlacePicker />
        </div>
      </section>

      {nationwide && (
        <p className="mt-4 rounded-lg bg-sunken/70 px-4 py-3 text-sm text-muted">
          United States view shows what can travel: shippable goods (postage
          free, or you cover stamps), remote help, and digital gifts. Couches
          and leftover soup stay local.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <FilterRow
          label="Kind"
          value={kind}
          options={KINDS.map((item) => ({ value: item, label: KIND_LABEL[item] }))}
          onChange={setKind}
        />
        <FilterRow
          label="What"
          value={category}
          options={CATEGORIES.map((item) => ({
            value: item,
            label: CATEGORY_LABEL[item],
          }))}
          onChange={setCategory}
        />
      </div>

      <p className="mt-6 text-sm text-muted">
        {listingsQuery.isPending
          ? "Looking nearby…"
          : listings.length === 0
            ? q
              ? `Nothing for “${q}” near ${place.city} · ${radiusLabel}`
              : `Quiet near ${place.city} · ${radiusLabel}`
            : `${listings.length} open near ${place.city} · ${radiusLabel}`}
      </p>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        {listingsQuery.isPending &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl bg-sunken/80"
            />
          ))}
        {!listingsQuery.isPending && listings.length === 0 && (
          <div className="rounded-xl bg-surface p-8 shadow-[var(--shadow-border)] md:col-span-2">
            <h2 className="font-display text-2xl font-medium">
              Quiet here this morning.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
              {q
                ? `No one has listed “${q}” this close. Widen the search, or ask — a neighbor with extra may see it.`
                : "Nothing matches this place and distance yet. Widen the search, or be the first to pass something along."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {nextRadius && (
                <button
                  type="button"
                  onClick={() => setRadiusMiles(nextRadius.miles)}
                  className="inline-flex h-11 items-center rounded-md bg-sunken px-4 text-sm font-medium text-ink hover:bg-sunken/70"
                >
                  Search {nextRadius.miles >= 2500 ? "the US" : nextRadius.label.toLowerCase()}
                </button>
              )}
              <Link
                to="/give"
                search={{ kind: "ask" }}
                className="inline-flex h-11 items-center rounded-md bg-clay px-4 text-sm font-medium text-clay-fg hover:bg-clay/90"
              >
                Ask for it
              </Link>
            </div>
          </div>
        )}
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </section>

      {!listingsQuery.isPending && (matchQuery.data ?? []).length > 0 && (
        <div className="mt-8">
          <MatchStrip matches={matchQuery.data ?? []} />
        </div>
      )}

      <section className="mt-10 grid grid-cols-3 gap-3">
        <Stat label="Open now" value={impact ? String(impact.openCount) : "—"} />
        <Stat
          label="Passed along"
          value={impact ? String(impact.givenCount) : "—"}
        />
        <Stat
          label="Pounds kept"
          value={impact ? impact.lbs.toLocaleString() : "—"}
        />
      </section>

      {listings.length > 1 && (
        <div className="mt-6">
          <CauseSlot />
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-3 shadow-[var(--shadow-border)]">
      <p className="text-[10px] font-medium uppercase tracking-wider text-faint">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-medium tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

function FilterRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (next: T | null) => void;
}) {
  return (
    <div className="-mx-4 flex flex-wrap items-center gap-2 overflow-x-auto px-4 pb-1">
      <span className="w-12 text-xs uppercase tracking-wider text-faint">{label}</span>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "h-11 min-h-11 rounded-full px-3.5 text-sm",
          value === null ? "bg-ink text-paper" : "bg-sunken text-muted hover:text-ink",
        )}
      >
        All
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value === value ? null : option.value)}
          className={cn(
            "h-11 min-h-11 rounded-full px-3.5 text-sm",
            value === option.value
              ? "bg-ink text-paper"
              : "bg-sunken text-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

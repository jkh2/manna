import { MapPin } from "lucide-react";
import { RADIUS_STEPS } from "@/lib/geo";
import { PLACES } from "@/lib/places";
import { usePlaceStore } from "@/lib/place-store";
import { cn } from "@/lib/utils";

export function PlacePicker({ compact = false }: { compact?: boolean }) {
  const { place, radiusMiles, setPlace, setRadiusMiles } = usePlaceStore();
  const stepIndex = Math.max(
    0,
    RADIUS_STEPS.findIndex((step) => step.miles === radiusMiles),
  );
  const active = RADIUS_STEPS[stepIndex] ?? RADIUS_STEPS[2];

  return (
    <div className={cn("flex flex-col gap-3", compact && "gap-2")}>
      <label className="flex min-h-11 items-center gap-2 rounded-lg bg-surface px-3 shadow-[var(--shadow-border)]">
        <MapPin className="size-4 shrink-0 text-clay" />
        <select
          className="h-11 w-full bg-transparent text-sm text-ink focus:outline-none"
          value={place.label}
          onChange={(event) => {
            const next = PLACES.find((item) => item.label === event.target.value);
            if (next) setPlace(next);
          }}
          aria-label="Your place"
        >
          {PLACES.map((item) => (
            <option key={item.label} value={item.label}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>Search as far as</span>
          <span className="font-medium text-ink">{active.label}</span>
        </div>
        <input
          type="range"
          min={0}
          max={RADIUS_STEPS.length - 1}
          step={1}
          value={stepIndex}
          onChange={(event) => {
            const next = RADIUS_STEPS[Number(event.target.value)];
            if (next) setRadiusMiles(next.miles);
          }}
          className="h-11 w-full accent-clay"
          aria-label="Search radius"
          suppressHydrationWarning
        />
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-faint">
          <span>Street</span>
          <span>United States</span>
        </div>
      </div>
    </div>
  );
}

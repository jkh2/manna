import { LocateFixed, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RADIUS_STEPS } from "@/lib/geo";
import { nearestPlace, PLACES } from "@/lib/places";
import { usePlaceStore } from "@/lib/place-store";
import { cn } from "@/lib/utils";

export function PlacePicker({
  compact = false,
  showRadius = true,
}: {
  compact?: boolean;
  showRadius?: boolean;
}) {
  const { place, radiusMiles, setPlace, setRadiusMiles } = usePlaceStore();
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error("This browser will not share a location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPlace(nearestPlace(position.coords.latitude, position.coords.longitude));
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast.error("Could not read your location. Choose a town instead.");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", compact && "gap-2")}>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-faint">
          I’m near
        </span>
        <div className="flex gap-2">
          <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg bg-sunken/80 px-3">
            <MapPin className="size-4 shrink-0 text-clay" />
            <select
              className="h-11 w-full bg-transparent text-sm text-ink focus:outline-none"
              value={place.label}
              onChange={(event) => {
                const next = PLACES.find((item) => item.label === event.target.value);
                if (next) setPlace(next);
              }}
              aria-label="Your town"
              suppressHydrationWarning
            >
              {PLACES.map((item) => (
                <option key={item.label} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-sunken px-3 text-sm text-ink hover:bg-sunken/70 disabled:opacity-60"
            aria-label="Use my location"
          >
            <LocateFixed className="size-4 text-clay" />
            <span className="hidden sm:inline">{locating ? "Finding…" : "Near me"}</span>
          </button>
        </div>
      </div>
      {showRadius && (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span className="font-medium uppercase tracking-wider text-faint">
              How far
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {RADIUS_STEPS.map((step) => {
              const active = step.miles === radiusMiles;
              const label = step.miles >= 2500 ? "US" : step.label;
              return (
                <button
                  key={step.miles}
                  type="button"
                  onClick={() => setRadiusMiles(step.miles)}
                  className={cn(
                    "h-11 min-h-11 rounded-full px-3.5 text-sm",
                    active ? "bg-ink text-paper" : "bg-sunken text-muted hover:text-ink",
                  )}
                  aria-pressed={active}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

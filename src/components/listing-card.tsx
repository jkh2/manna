import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { formatMiles } from "@/lib/geo";
import { timeAgo } from "@/lib/format";
import {
  CATEGORY_LABEL,
  handoffSummary,
  KIND_LABEL,
  type Listing,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_TONE: Record<Listing["kind"], "clay" | "sage" | "default" | "mute"> = {
  give: "clay",
  lend: "sage",
  offer: "default",
  ask: "mute",
};

export function ListingCard({ listing }: { listing: Listing }) {
  const postageTone =
    listing.fulfillment === "ship_prepaid"
      ? "sage"
      : listing.fulfillment === "ship"
        ? "default"
        : null;

  return (
    <Link
      to="/listing/$id"
      params={{ id: listing.id }}
      className={cn(
        "group block overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
        "transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:shadow-[var(--shadow-border-hover)] hover:-translate-y-0.5",
      )}
    >
      {listing.photoUrl && (
        <img
          src={listing.photoUrl}
          alt=""
          className="aspect-[4/3] w-full object-cover outline outline-1 -outline-offset-1 outline-ink/10"
        />
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={KIND_TONE[listing.kind]}>{KIND_LABEL[listing.kind]}</Badge>
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            {CATEGORY_LABEL[listing.category]}
          </span>
          {postageTone && (
            <Badge tone={postageTone}>
              {listing.fulfillment === "ship_prepaid" ? "Shipping is free" : "You cover postage"}
            </Badge>
          )}
        </div>
        <h3 className="mt-3 font-display text-xl font-medium leading-snug tracking-tight text-ink group-hover:text-clay">
          {listing.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {listing.description}
        </p>
        {!postageTone && (
          <p className="mt-3 text-sm font-medium text-ink">{handoffSummary(listing)}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
          <span>
            {listing.city}, {listing.region}
          </span>
          {listing.miles != null && <span>{formatMiles(listing.miles)}</span>}
          <span>{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

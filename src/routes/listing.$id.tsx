import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { timeAgo } from "@/lib/format";
import {
  expressInterest,
  getListing,
  hasMyInterest,
  listingInterests,
  matchesForListing,
  setListingStatus,
} from "@/lib/listings";
import {
  CATEGORY_LABEL,
  FULFILLMENT_LABEL,
  isLocalPickup,
  isShipped,
  KIND_LABEL,
} from "@/lib/types";

export const Route = createFileRoute("/listing/$id")({
  component: ListingPage,
});

function ListingPage() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const queryClient = useQueryClient();

  const listingQuery = useQuery({
    queryKey: ["listing", id],
    queryFn: () => getListing({ data: { id } }),
  });

  const listing = listingQuery.data;
  const isOwner = Boolean(user && listing && listing.userId === user.id);

  const mineQuery = useQuery({
    queryKey: ["my-interest", id],
    queryFn: () => hasMyInterest({ data: { listingId: id } }),
    enabled: Boolean(user) && !isOwner && listing?.status === "open",
  });

  const interestsQuery = useQuery({
    queryKey: ["interests", id],
    queryFn: () => listingInterests({ data: { listingId: id } }),
    enabled: isOwner,
  });

  const matchQuery = useQuery({
    queryKey: ["listing-matches", id],
    queryFn: () => matchesForListing({ data: { id } }),
    enabled: Boolean(listing),
  });

  if (listingQuery.isPending) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl bg-sunken/80" />
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-display text-3xl">That offering has gone.</h1>
        <p className="mt-2 text-muted">It may have been claimed, or the link is old.</p>
        <Link to="/" className="mt-6 inline-flex text-clay hover:underline">
          Back to this morning
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm text-muted">
        <Link to="/" className="hover:text-ink">
          Manna
        </Link>
        <span className="mx-2 text-faint">/</span>
        {listing.city}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={listing.kind === "give" ? "clay" : listing.kind === "lend" ? "sage" : "default"}>
          {KIND_LABEL[listing.kind]}
        </Badge>
        <Badge>{CATEGORY_LABEL[listing.category]}</Badge>
        {listing.status !== "open" && <Badge tone="mute">{listing.status}</Badge>}
      </div>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight">{listing.title}</h1>
      <p className="mt-3 text-sm text-muted">
        {listing.giverName} · {listing.city}, {listing.region} · {timeAgo(listing.createdAt)}
      </p>

      <div className="mt-5 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <p className="text-xs uppercase tracking-wider text-faint">How to get this</p>
        <p className="mt-1 text-base font-medium">
          {listing.fulfillment === "ship_prepaid"
            ? "Shipping is free"
            : listing.fulfillment === "ship"
              ? "You cover postage"
              : isLocalPickup(listing.fulfillment)
                ? "Local pickup"
                : FULFILLMENT_LABEL[listing.fulfillment]}
        </p>
        {listing.fulfillment === "ship_prepaid" && (
          <p className="mt-1 text-sm leading-relaxed text-muted">
            The giver will mail it and pay the post office. The gift itself is free.
          </p>
        )}
        {listing.fulfillment === "ship" && (
          <p className="mt-1 text-sm leading-relaxed text-muted">
            They will ship. You pay postage — not for the item.
          </p>
        )}
        {isLocalPickup(listing.fulfillment) && (
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {listing.pickupPlace
              ? listing.pickupPlace
              : FULFILLMENT_LABEL[listing.fulfillment]}
          </p>
        )}
        {listing.nationalOk && isShipped(listing.fulfillment) && (
          <p className="mt-1 text-xs text-faint">Can travel anywhere in the US.</p>
        )}
      </div>

      {listing.photoUrl && (
        <img
          src={listing.photoUrl}
          alt=""
          className="mt-6 aspect-[4/3] w-full rounded-xl object-cover outline outline-1 -outline-offset-1 outline-ink/10"
        />
      )}
      <p className="mt-6 text-base leading-relaxed text-ink">{listing.description}</p>
      <dl className="mt-8 grid gap-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wider text-faint">Meet</dt>
          <dd className="mt-1 text-sm font-medium">
            {isLocalPickup(listing.fulfillment)
              ? FULFILLMENT_LABEL[listing.fulfillment]
              : listing.fulfillment === "remote"
                ? "Remote — no porch needed"
                : "Ships"}
          </dd>
        </div>
        {listing.pickupPlace && (
          <div>
            <dt className="text-xs uppercase tracking-wider text-faint">Pickup at</dt>
            <dd className="mt-1 text-sm">{listing.pickupPlace}</dd>
          </div>
        )}
        {listing.condition && (
          <div>
            <dt className="text-xs uppercase tracking-wider text-faint">Condition</dt>
            <dd className="mt-1 text-sm">{listing.condition}</dd>
          </div>
        )}
        {listing.nationalOk && (
          <div>
            <dt className="text-xs uppercase tracking-wider text-faint">Distance</dt>
            <dd className="mt-1 text-sm">
              {isShipped(listing.fulfillment)
                ? "Can travel — ships anywhere in the US"
                : "Can travel — remote, no porch needed"}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs uppercase tracking-wider text-faint">Interest</dt>
          <dd className="mt-1 text-sm tabular-nums">
            {listing.interestCount === 0
              ? "No one yet"
              : `${listing.interestCount} neighbor${listing.interestCount === 1 ? "" : "s"}`}
          </dd>
        </div>
      </dl>

      {(matchQuery.data ?? []).length > 0 && (
        <section className="mt-8 rounded-xl bg-sunken/70 p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-clay">
            A neighbor may already have this
          </p>
          <ul className="mt-3 space-y-2">
            {(matchQuery.data ?? []).map((match) => {
              const otherId = listing.kind === "ask" ? match.offerId : match.askId;
              const otherTitle = listing.kind === "ask" ? match.offerTitle : match.askTitle;
              return (
                <li key={`${match.askId}-${match.offerId}`}>
                  <Link
                    to="/listing/$id"
                    params={{ id: otherId }}
                    className="font-medium hover:text-clay"
                  >
                    {otherTitle}
                  </Link>
                  <span className="ml-2 text-xs text-faint">{match.reason}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {listing.status === "open" && !isOwner && (
        <div className="mt-8">
          {isPending ? (
            <div className="h-24 animate-pulse rounded-xl bg-sunken/80" />
          ) : (
            <>
              <SignedOut>
                <p className="text-sm text-muted">
                  Sign in to ask for this. The giver chooses who receives it — it is not first-come.
                </p>
                <Button asChild className="mt-3">
                  <Link to="/login">Sign in to ask</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                {mineQuery.data ? (
                  <p className="rounded-lg bg-sunken px-4 py-3 text-sm text-ink">
                    You’re in line. The giver chooses — they will see you asked.
                  </p>
                ) : (
                  <InterestForm listingId={id} kind={listing.kind} />
                )}
              </SignedIn>
            </>
          )}
        </div>
      )}

      {isOwner && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Who asked</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["promised", "given", "open"] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={listing.status === status ? "default" : "outline"}
                onClick={() =>
                  setListingStatus({ data: { listingId: id, status } }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["listing", id] });
                    toast.success(
                      status === "given"
                        ? "Marked as passed along."
                        : status === "promised"
                          ? "Promised."
                          : "Opened again.",
                    );
                  })
                }
              >
                {status === "given" ? "Passed along" : status === "promised" ? "Promised" : "Still open"}
              </Button>
            ))}
          </div>
          <ul className="mt-4 space-y-3">
            {(interestsQuery.data ?? []).length === 0 && (
              <li className="text-sm text-muted">No one has asked yet.</li>
            )}
            {(interestsQuery.data ?? []).map((row) => (
              <li
                key={row.id}
                className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]"
              >
                <p className="text-xs text-faint">Neighbor · {timeAgo(row.created_at)}</p>
                <p className="mt-1 text-sm leading-relaxed">
                  {row.note || "Happy to take this, with thanks."}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function InterestForm({
  listingId,
  kind,
}: {
  listingId: string;
  kind: string;
}) {
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => expressInterest({ data: { listingId, note } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-interest", listingId] });
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
      toast.success("You asked. The giver chooses.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const prompt =
    kind === "ask"
      ? "I can help with this."
      : kind === "lend"
        ? "I will borrow this and bring it back."
        : "I can use this, with thanks.";
  const action =
    kind === "ask"
      ? "I can help"
      : kind === "lend"
        ? "I’d like to borrow this"
        : "I’d like this";

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <p className="text-sm text-muted">
        The giver chooses who receives this. It is not first-come.
      </p>
      <label className="block text-sm font-medium">A short note</label>
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={prompt}
        maxLength={400}
      />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending…" : action}
      </Button>
    </form>
  );
}

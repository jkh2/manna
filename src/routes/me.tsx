import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { myListings, myPings } from "@/lib/listings";

export const Route = createFileRoute("/me")({ component: MePage });

function MePage() {
  const { user, isPending } = useCurrentUserState();
  const listingsQuery = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => myListings(),
    enabled: Boolean(user),
  });
  const pingsQuery = useQuery({
    queryKey: ["my-pings"],
    queryFn: () => myPings(),
    enabled: Boolean(user),
  });

  if (isPending) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-40 animate-pulse rounded-xl bg-sunken/80" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const listings = listingsQuery.data ?? [];
  const pings = pingsQuery.data ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-clay">
        Your porch
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        {user.displayName || "Neighbor"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        What you have set out. The giver always chooses who receives it.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link to="/give">Give or ask</Link>
        </Button>
      </div>

      {pings.length > 0 && (
        <section className="mt-8 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-2xl">A neighbor may have what you asked for</h2>
          <ul className="mt-4 space-y-3">
            {pings.map((ping) => (
              <li key={`${ping.ask_id}-${ping.offer_id}`} className="text-sm">
                <Link
                  to="/listing/$id"
                  params={{ id: ping.offer_id }}
                  className="font-medium hover:text-clay"
                >
                  {ping.offer_title}
                </Link>
                <span className="text-muted"> may answer </span>
                <Link
                  to="/listing/$id"
                  params={{ id: ping.ask_id }}
                  className="font-medium hover:text-clay"
                >
                  {ping.ask_title}
                </Link>
                <p className="text-xs text-faint">{ping.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {listingsQuery.isPending && (
          <div className="h-40 animate-pulse rounded-xl bg-sunken/80 md:col-span-2" />
        )}
        {!listingsQuery.isPending && listings.length === 0 && (
          <p className="text-sm text-muted md:col-span-2">
            Nothing of yours is out yet. Extra zucchini counts.
          </p>
        )}
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </section>
    </main>
  );
}

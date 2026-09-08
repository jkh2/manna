import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { pledgeCount, savePledge } from "@/lib/listings";

export const Route = createFileRoute("/covenant")({ component: CovenantPage });

function CovenantPage() {
  const { user, isPending } = useCurrentUserState();
  const queryClient = useQueryClient();
  const countQuery = useQuery({ queryKey: ["pledges"], queryFn: () => pledgeCount() });
  const [amount, setAmount] = useState("10");
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      savePledge({
        data: {
          amount: Math.max(0, Number.parseInt(amount, 10) || 0) || null,
          note: note.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Hand raised. We will not charge a card.");
      queryClient.invalidateQueries({ queryKey: ["pledges"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const neighbors = countQuery.data ?? 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-clay">
        How this stays free
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        The covenant
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted">
        Manna is a gift economy. The listings stay free. The money, if there is
        any, keeps the porch light on — hosting, moderation, a few texts — and
        never turns a neighbor’s extra into inventory.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-medium">What we will take</h2>
        <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
          <li>Quiet donations, Wikipedia-style, with a public boring budget.</li>
          <li>
            Labeled neighbor causes: a pantry, disaster relief, a Habitat build,
            a blood drive. They look like causes, never like a Give.
          </li>
          <li>
            Public-service notes from a town or waste district — bulk trash day,
            campus move-out — because reuse is cheaper than the dump.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-medium">What we will not</h2>
        <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
          <li>Anything for sale that belongs on this porch as a gift.</li>
          <li>Fake listings. Boosted couches. “Similar items for $49.”</li>
          <li>Payday loans, gambling, MLM, weapons, alcohol, political campaigns.</li>
          <li>Lead-gen, free trials, coupon mazes.</li>
          <li>Typical venture capital. Attention that must grow forever ruins this.</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl font-medium">Causes, if we host them</h2>
        <p className="text-base leading-relaxed text-muted">
          Nearby zoom prefers local pantries and shelters. Wider zoom may include
          national and international relief that publishes its books. Faith-based
          work is welcome when the service is not conversion-gated. A Give never
          has to out-shout a paid appeal.
        </p>
      </section>

      <section className="mt-10 rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-2xl font-medium">Keep the lights on</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          There is no card to charge yet. This is a hand raised: if Manna becomes
          a real porch with a nonprofit account, we may write once. No dark
          patterns. No locking features behind a tip jar.
        </p>
        <p className="mt-3 text-sm tabular-nums text-ink">
          {neighbors === 0
            ? "No one has raised a hand yet."
            : `${neighbors} neighbor${neighbors === 1 ? "" : "s"} would help.`}
        </p>

        {isPending ? (
          <div className="mt-4 h-24 animate-pulse rounded-lg bg-sunken/80" />
        ) : (
          <>
            <SignedOut>
              <Button asChild className="mt-4">
                <Link to="/login">Sign in to raise a hand</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <form
                className="mt-4 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  mutation.mutate();
                }}
              >
                <label className="block space-y-1">
                  <span className="text-sm font-medium">A yearly amount you might give, if asked</span>
                  <Input
                    inputMode="numeric"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">A note, if you want</span>
                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={240}
                    placeholder="Optional."
                  />
                </label>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving…" : "I’ll help keep the lights on"}
                </Button>
                {user?.displayName && (
                  <p className="text-xs text-faint">Signed in as {user.displayName}.</p>
                )}
              </form>
            </SignedIn>
          </>
        )}
      </section>

      <p className="mt-10 text-sm text-muted">
        <Link to="/about" className="hover:text-ink">
          Back to the story
        </Link>
      </p>
    </main>
  );
}

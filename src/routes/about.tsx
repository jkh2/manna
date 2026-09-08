import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-clay">
        The story
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        Manna
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink">
        In the wilderness, enough appeared for the day. Those who tried to
        hoard it found it spoiled. Take what you need. Leave the rest for your
        neighbor.
      </p>
      <p className="mt-4 text-base leading-relaxed text-muted">
        Manna is a porch for the extra: a dresser, leftover bread, a truck on
        Saturday, an hour of help, a seed packet that can travel. It is not a
        marketplace. There is no price, no offer, no trial that wants a card.
        If it is here, it is free.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-medium">How it works</h2>
        <p className="text-base leading-relaxed text-muted">
          Start nearby. Widen the search when you need to — across the valley,
          the state, or the whole United States. Distant search only keeps what
          can travel: things someone will ship, help that can be done remotely,
          digital gifts. Couches and soup stay local.
        </p>
        <p className="text-base leading-relaxed text-muted">
          Physical gifts say how they move. Local pickup names a place — a porch,
          a library lot, a cooler on the step. If it ships, you will see whether
          postage is free (the giver pays the post office) or whether you cover
          stamps. The item is never for sale.
        </p>
        <p className="text-base leading-relaxed text-muted">
          You may give, lend, offer time, or ask. The giver chooses who
          receives. No-shows are remembered. Car seats, weapons, and anything
          that is a sales pitch do not belong here.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-medium">Keeping the lights on</h2>
        <p className="text-base leading-relaxed text-muted">
          Manna should stay free to use. We will ask for donations the way a
          public library does — quietly, with a public budget — and we may host
          a few labeled neighbor causes: a pantry, disaster relief, a Habitat
          build. Never an ad that sells what belongs on the porch. Never a
          listing that is secretly for sale.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link to="/covenant">Read the covenant</Link>
        </Button>
      </section>

      <section className="mt-10 rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
        <p className="font-display text-xl leading-snug text-ink">
          Whoever has two coats must share with anyone who has none; and whoever
          has food must do likewise.
        </p>
        <p className="mt-3 text-xs uppercase tracking-wider text-faint">Luke 3:11</p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/give">Pass something along</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">See what is near</Link>
        </Button>
      </div>
    </main>
  );
}

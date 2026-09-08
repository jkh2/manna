import { Link } from "@tanstack/react-router";

export function CauseSlot() {
  return (
    <aside className="rounded-xl border border-dashed border-border bg-surface/60 p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-faint">
        A neighbor cause
      </p>
      <h3 className="mt-2 font-display text-lg font-medium text-ink">
        Valley Community Pantry
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Meals and groceries for families in the San Luis Valley. Manna will host a
        few causes like this — labeled, never mixed into the free listings, never
        a product for sale.
      </p>
      <p className="mt-3 text-xs text-faint">
        Sample placement.{" "}
        <Link to="/covenant" className="underline-offset-2 hover:underline">
          How we take money
        </Link>
      </p>
    </aside>
  );
}

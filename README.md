# Manna

Neighbors pass along what they do not need — a dresser, leftover bread, a truck on Saturday, an hour of help. If it is here, it is free.

Manna is a gift-economy porch, not a marketplace. There is no price, no offer, no listing that is secretly for sale.

## What it does

- **Nearby first.** Start in town, widen to the valley, the state, or the whole United States. Distant search only keeps what can travel: shippable goods, remote help, digital gifts. Couches and soup stay local.
- **Give, lend, offer time, or ask.** The giver chooses who receives.
- **How it moves.** Local pickup with a named place, or ship with postage free (the giver pays) or you cover stamps. The item itself is always free.
- **Matched nearby.** When an Ask lands next to a Give, both porches get pinged.
- **The covenant.** Quiet donations, labeled neighbor causes, never an ad selling what’s on the porch.

## Stack

React 19, TanStack Start, Tailwind v4, Postgres (Neon in production; PGLite in local preview), Better Auth.

## Local development

```bash
npm install
npm run dev
```

The app listens on port 8080.

```bash
npm run typecheck
npm run build
```

## Production notes

Set `DATABASE_URL` for Postgres. Auth credentials are injected by the host; do not commit secrets. Only `VITE_`-prefixed variables reach the browser.

## Covenant

Read [the covenant](src/routes/covenant.tsx) in the app: listings stay free. Money, if any, keeps the porch light on.

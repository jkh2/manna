import type { Kind, Listing } from "@/lib/types";

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "please",
  "take",
  "some",
  "still",
  "used",
  "looking",
  "need",
  "needed",
  "wants",
  "want",
  "extra",
  "leftover",
  "about",
  "your",
  "our",
  "can",
  "will",
  "just",
  "into",
  "onto",
  "have",
  "has",
  "been",
  "very",
  "good",
  "size",
  "near",
  "free",
  "anyone",
  "something",
  "get",
  "got",
]);

export function tokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP.has(word)),
  );
}

export function isAsk(kind: Kind) {
  return kind === "ask";
}

export function isOfferKind(kind: Kind) {
  return kind === "give" || kind === "lend" || kind === "offer";
}

export function areOpposites(a: Kind, b: Kind) {
  return (isAsk(a) && isOfferKind(b)) || (isOfferKind(a) && isAsk(b));
}

export function sharedWords(a: string, b: string): string[] {
  const left = tokens(a);
  const right = tokens(b);
  return [...left].filter((word) => right.has(word));
}

export type MatchHit = {
  ask: Listing;
  offer: Listing;
  words: string[];
  reason: string;
};

export function scorePair(ask: Listing, offer: Listing): MatchHit | null {
  if (!areOpposites(ask.kind, offer.kind)) return null;
  const askSide = isAsk(ask.kind) ? ask : offer;
  const offerSide = isAsk(ask.kind) ? offer : ask;
  const words = sharedWords(
    `${askSide.title} ${askSide.category}`,
    `${offerSide.title} ${offerSide.category}`,
  );
  const sameCategory = askSide.category === offerSide.category;
  if (!sameCategory && words.length < 2) return null;
  if (sameCategory && words.length === 0) return null;
  const label = words.slice(0, 3).join(", ");
  const reason = sameCategory
    ? `Both ${askSide.category}${label ? ` · ${label}` : ""}`
    : `Shared: ${label}`;
  return { ask: askSide, offer: offerSide, words, reason };
}

export function pairMatches(listings: Listing[]): MatchHit[] {
  const asks = listings.filter((item) => isAsk(item.kind));
  const offers = listings.filter((item) => isOfferKind(item.kind));
  const hits: MatchHit[] = [];
  const seen = new Set<string>();
  for (const ask of asks) {
    let best: MatchHit | null = null;
    for (const offer of offers) {
      const hit = scorePair(ask, offer);
      if (!hit) continue;
      if (!best || hit.words.length > best.words.length) best = hit;
    }
    if (!best) continue;
    const key = `${best.ask.id}:${best.offer.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push(best);
  }
  return hits.sort((a, b) => b.words.length - a.words.length);
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { LOCAL_CUTOFF_MILES, milesBetween } from "@/lib/geo";
import { pairMatches, scorePair, type MatchHit } from "@/lib/match";
import { SEED_LISTINGS, SEED_PHOTOS, SEED_USER } from "@/lib/seed-data";
import type { Category, Fulfillment, Kind, Listing, Status } from "@/lib/types";
import { canTravel, FULFILLMENTS, isLocalPickup } from "@/lib/types";

type ListingRow = {
  id: string;
  user_id: string;
  kind: Kind;
  category: Category;
  title: string;
  description: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  fulfillment: Fulfillment;
  national_ok: boolean;
  condition: string | null;
  status: Status;
  giver_name: string;
  estimated_lbs: number;
  created_at: string;
  interest_count: number;
  photo_url: string | null;
  pickup_place: string | null;
};

function mapListing(row: ListingRow, origin?: { lat: number; lng: number }): Listing {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    category: row.category,
    title: row.title,
    description: row.description,
    city: row.city,
    region: row.region,
    lat: Number(row.lat),
    lng: Number(row.lng),
    fulfillment: row.fulfillment,
    nationalOk: Boolean(row.national_ok),
    condition: row.condition,
    status: row.status,
    giverName: row.giver_name,
    estimatedLbs: Number(row.estimated_lbs) || 0,
    createdAt: row.created_at,
    miles: origin
      ? milesBetween(origin, { lat: Number(row.lat), lng: Number(row.lng) })
      : null,
    interestCount: Number(row.interest_count) || 0,
    photoUrl: sanitizePhoto(row.photo_url),
    pickupPlace: row.pickup_place?.trim() || null,
  };
}

let seeded = false;

async function ensureSeed() {
  if (seeded) return;
  const sql = await getSql();
  for (const item of SEED_LISTINGS) {
    const created = new Date(Date.now() - item.hoursAgo * 3600 * 1000).toISOString();
    const photo = SEED_PHOTOS[item.id] ?? null;
    const pickupPlace = item.pickupPlace ?? null;
    await sql`
      insert into listings (
        id, user_id, kind, category, title, description, city, region, lat, lng,
        fulfillment, national_ok, condition, status, giver_name, estimated_lbs, created_at, photo_url, pickup_place
      ) values (
        ${item.id}, ${SEED_USER}, ${item.kind}, ${item.category}, ${item.title},
        ${item.description}, ${item.city}, ${item.region}, ${item.lat}, ${item.lng},
        ${item.fulfillment}, ${item.nationalOk}, ${item.condition}, 'open',
        ${item.giverName}, ${item.estimatedLbs}, ${created}, ${photo}, ${pickupPlace}
      )
      on conflict (id) do nothing
    `;
    await sql`
      update listings
      set
        description = ${item.description},
        fulfillment = ${item.fulfillment},
        national_ok = ${item.nationalOk},
        pickup_place = ${pickupPlace},
        giver_name = ${item.giverName},
        photo_url = coalesce(nullif(photo_url, ''), ${photo})
      where id = ${item.id}
    `;
  }
  seeded = true;
}

const browseInput = z.object({
  lat: z.number(),
  lng: z.number(),
  radiusMiles: z.number(),
  kind: z.enum(["give", "lend", "offer", "ask"]).nullable(),
  category: z
    .enum(["goods", "food", "help", "plants", "kids", "materials", "digital"])
    .nullable(),
  q: z.string().max(80).nullable().optional(),
});

export const browseListings = createServerFn({ method: "GET" })
  .validator((data: unknown) => browseInput.parse(data))
  .handler(async ({ data }) => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql<ListingRow>`
      select l.*,
        (select count(*)::int from interests i where i.listing_id = l.id) as interest_count
      from listings l
      where l.status = 'open'
      order by l.created_at desc
    `;
    const origin = { lat: data.lat, lng: data.lng };
    const nationwide = data.radiusMiles >= 2500;
    const needle = (data.q ?? "").trim().toLowerCase();
    return rows
      .map((row) => mapListing(row, origin))
      .filter((listing) => {
        const miles = listing.miles ?? 9999;
        if (miles > data.radiusMiles) return false;
        if (nationwide && miles > LOCAL_CUTOFF_MILES && !listing.nationalOk) return false;
        if (data.kind && listing.kind !== data.kind) return false;
        if (data.category && listing.category !== data.category) return false;
        if (needle) {
          const hay =
            `${listing.title} ${listing.description} ${listing.city} ${listing.pickupPlace ?? ""}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.miles ?? 0) - (b.miles ?? 0));
  });

export const getListing = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql<ListingRow>`
      select l.*,
        (select count(*)::int from interests i where i.listing_id = l.id) as interest_count
      from listings l
      where l.id = ${data.id}
    `;
    const row = rows[0];
    if (!row) return null;
    return mapListing(row);
  });

export const getImpact = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<{ open_count: number; given_count: number; lbs: number }>`
    select
      count(*) filter (where status = 'open')::int as open_count,
      count(*) filter (where status = 'given')::int as given_count,
      coalesce(sum(estimated_lbs) filter (where status in ('open', 'given', 'promised')), 0)::int as lbs
    from listings
  `;
  return {
    openCount: rows[0]?.open_count ?? 0,
    givenCount: rows[0]?.given_count ?? 0,
    lbs: rows[0]?.lbs ?? 0,
  };
});

const createInput = z.object({
  kind: z.enum(["give", "lend", "offer", "ask"]),
  category: z.enum(["goods", "food", "help", "plants", "kids", "materials", "digital"]),
  title: z.string().min(3).max(80),
  description: z.string().min(10).max(1200),
  city: z.string().min(1).max(80),
  region: z.string().min(2).max(40),
  lat: z.number(),
  lng: z.number(),
  fulfillment: z.enum(FULFILLMENTS),
  condition: z.string().max(40).nullable(),
  giverName: z.string().min(1).max(60),
  estimatedLbs: z.number().int().min(0).max(2000),
  photoUrl: z.string().max(350000).nullable(),
  pickupPlace: z.string().max(120).nullable(),
});

export const createListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) => createInput.parse(data))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = `${slugify(data.title)}-${Math.random().toString(36).slice(2, 7)}`;
    const nationalOk = canTravel(data.fulfillment);
    const photoUrl = sanitizePhoto(data.photoUrl);
    const pickupPlace = isLocalPickup(data.fulfillment)
      ? data.pickupPlace?.trim() || null
      : null;
    await sql`
      insert into listings (
        id, user_id, kind, category, title, description, city, region, lat, lng,
        fulfillment, national_ok, condition, status, giver_name, estimated_lbs, photo_url, pickup_place
      ) values (
        ${id}, ${context.userId}, ${data.kind}, ${data.category}, ${data.title},
        ${data.description}, ${data.city}, ${data.region}, ${data.lat}, ${data.lng},
        ${data.fulfillment}, ${nationalOk}, ${data.condition}, 'open',
        ${data.giverName}, ${data.estimatedLbs}, ${photoUrl}, ${pickupPlace}
      )
    `;
    const created = mapListing({
      id,
      user_id: context.userId,
      kind: data.kind,
      category: data.category,
      title: data.title,
      description: data.description,
      city: data.city,
      region: data.region,
      lat: data.lat,
      lng: data.lng,
      fulfillment: data.fulfillment,
      national_ok: nationalOk,
      condition: data.condition,
      status: "open",
      giver_name: data.giverName,
      estimated_lbs: data.estimatedLbs,
      created_at: new Date().toISOString(),
      interest_count: 0,
      photo_url: photoUrl,
      pickup_place: pickupPlace,
    });
    const nearby = await loadOpenListings({ lat: data.lat, lng: data.lng });
    const matches = nearby
      .filter((item) => item.id !== id)
      .map((item) => scorePair(created, item))
      .filter((hit): hit is MatchHit => Boolean(hit))
      .filter((hit) => (hit.offer.miles ?? 0) <= LOCAL_CUTOFF_MILES || created.nationalOk || hit.offer.nationalOk)
      .slice(0, 5);
    for (const hit of matches) {
      await sql`
        insert into pings (ask_listing_id, offer_listing_id, reason)
        values (${hit.ask.id}, ${hit.offer.id}, ${hit.reason})
        on conflict (ask_listing_id, offer_listing_id) do nothing
      `;
    }
    return {
      id,
      matches: matches.map((hit) => ({
        askId: hit.ask.id,
        askTitle: hit.ask.title,
        offerId: hit.offer.id,
        offerTitle: hit.offer.title,
        reason: hit.reason,
      })),
    };
  });

export const myListings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ListingRow>`
      select l.*,
        (select count(*)::int from interests i where i.listing_id = l.id) as interest_count
      from listings l
      where l.user_id = ${context.userId}
      order by l.created_at desc
    `;
    return rows.map((row) => mapListing(row));
  });

export const expressInterest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z.object({ listingId: z.string(), note: z.string().max(400) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const listing = await sql<{ user_id: string; status: string }>`
      select user_id, status from listings where id = ${data.listingId}
    `;
    if (!listing[0] || listing[0].status !== "open") {
      throw new Error("This offering is no longer open.");
    }
    if (listing[0].user_id === context.userId) {
      throw new Error("This one is already yours.");
    }
    await sql`
      insert into interests (listing_id, user_id, note)
      values (${data.listingId}, ${context.userId}, ${data.note})
      on conflict (listing_id, user_id) do update set note = excluded.note
    `;
    return { ok: true as const };
  });

export const listingInterests = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: unknown) => z.object({ listingId: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const owner = await sql<{ user_id: string }>`
      select user_id from listings where id = ${data.listingId}
    `;
    if (!owner[0] || owner[0].user_id !== context.userId) return [];
    return sql<{ id: number; user_id: string; note: string; created_at: string }>`
      select id, user_id, note, created_at from interests
      where listing_id = ${data.listingId}
      order by created_at asc
    `;
  });

export const setListingStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z
      .object({
        listingId: z.string(),
        status: z.enum(["open", "promised", "given", "expired"]),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update listings
      set status = ${data.status}
      where id = ${data.listingId} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const hasMyInterest = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: unknown) => z.object({ listingId: z.string() }).parse(data))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      select id from interests
      where listing_id = ${data.listingId} and user_id = ${context.userId}
    `;
    return rows.length > 0;
  });

export const listMatches = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z.object({ lat: z.number(), lng: z.number(), radiusMiles: z.number() }).parse(data),
  )
  .handler(async ({ data }) => {
    await ensureSeed();
    const nearby = await loadOpenListings(data);
    const inRadius = nearby.filter((item) => {
      const miles = item.miles ?? 9999;
      if (miles > data.radiusMiles) return false;
      if (miles > LOCAL_CUTOFF_MILES && !item.nationalOk) return false;
      return true;
    });
    return pairMatches(inRadius).slice(0, 4).map(serializeHit);
  });

export const matchesForListing = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await ensureSeed();
    const listing = await getListing({ data: { id: data.id } });
    if (!listing) return [];
    const nearby = await loadOpenListings({ lat: listing.lat, lng: listing.lng });
    return nearby
      .filter((item) => item.id !== listing.id)
      .map((item) => scorePair(listing, item))
      .filter((hit): hit is MatchHit => Boolean(hit))
      .filter((hit) => (hit.ask.miles ?? 0) <= LOCAL_CUTOFF_MILES || hit.offer.nationalOk)
      .slice(0, 4)
      .map(serializeHit);
  });

export const myPings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      ask_id: string;
      ask_title: string;
      offer_id: string;
      offer_title: string;
      reason: string;
      created_at: string;
    }>`
      select
        a.id as ask_id, a.title as ask_title,
        o.id as offer_id, o.title as offer_title,
        p.reason, p.created_at
      from pings p
      join listings a on a.id = p.ask_listing_id
      join listings o on o.id = p.offer_listing_id
      where a.user_id = ${context.userId} or o.user_id = ${context.userId}
      order by p.created_at desc
      limit 12
    `;
    return rows;
  });

export const pledgeCount = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ c: number }>`select count(*)::int as c from pledges`;
  return rows[0]?.c ?? 0;
});

export const savePledge = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: unknown) =>
    z
      .object({
        amount: z.number().int().min(0).max(5000).nullable(),
        note: z.string().max(240),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into pledges (user_id, amount, note)
      values (${context.userId}, ${data.amount}, ${data.note})
      on conflict (user_id) do update set amount = excluded.amount, note = excluded.note
    `;
    return { ok: true as const };
  });

async function loadOpenListings(origin: { lat: number; lng: number }) {
  const sql = await getSql();
  const rows = await sql<ListingRow>`
    select l.*,
      (select count(*)::int from interests i where i.listing_id = l.id) as interest_count
    from listings l
    where l.status = 'open'
  `;
  return rows.map((row) => mapListing(row, origin));
}

function serializeHit(hit: MatchHit) {
  return {
    askId: hit.ask.id,
    askTitle: hit.ask.title,
    offerId: hit.offer.id,
    offerTitle: hit.offer.title,
    reason: hit.reason,
    askPhoto: hit.ask.photoUrl,
    offerPhoto: hit.offer.photoUrl,
  };
}

function sanitizePhoto(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/listings/") && !url.includes("..") && url.length < 200) return url;
  if (
    (url.startsWith("data:image/jpeg") ||
      url.startsWith("data:image/png") ||
      url.startsWith("data:image/webp")) &&
    url.length <= 350_000
  ) {
    return url;
  }
  return null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

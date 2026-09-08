export const KINDS = ["give", "lend", "offer", "ask"] as const;
export type Kind = (typeof KINDS)[number];

export const CATEGORIES = [
  "goods",
  "food",
  "help",
  "plants",
  "kids",
  "materials",
  "digital",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const FULFILLMENTS = [
  "porch",
  "public",
  "pickup",
  "ship",
  "ship_prepaid",
  "remote",
] as const;
export type Fulfillment = (typeof FULFILLMENTS)[number];

export const STATUSES = ["open", "promised", "given", "expired"] as const;
export type Status = (typeof STATUSES)[number];

export type Listing = {
  id: string;
  userId: string;
  kind: Kind;
  category: Category;
  title: string;
  description: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  fulfillment: Fulfillment;
  nationalOk: boolean;
  condition: string | null;
  status: Status;
  giverName: string;
  estimatedLbs: number;
  createdAt: string;
  miles: number | null;
  interestCount: number;
  photoUrl: string | null;
  pickupPlace: string | null;
};

export type Interest = {
  id: number;
  listingId: string;
  userId: string;
  note: string;
  createdAt: string;
};

export const KIND_LABEL: Record<Kind, string> = {
  give: "Give",
  lend: "Lend",
  offer: "Offer",
  ask: "Ask",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  goods: "Goods",
  food: "Food",
  help: "Help",
  plants: "Plants",
  kids: "Kids",
  materials: "Materials",
  digital: "Digital",
};

export const FULFILLMENT_LABEL: Record<Fulfillment, string> = {
  porch: "Local pickup — porch",
  public: "Local pickup — meet in public",
  pickup: "Local pickup — we'll arrange",
  ship: "You cover postage",
  ship_prepaid: "Shipping is free",
  remote: "Remote — no travel",
};

export function isLocalPickup(fulfillment: Fulfillment) {
  return fulfillment === "porch" || fulfillment === "public" || fulfillment === "pickup";
}

export function isShipped(fulfillment: Fulfillment) {
  return fulfillment === "ship" || fulfillment === "ship_prepaid";
}

export function canTravel(fulfillment: Fulfillment) {
  return isShipped(fulfillment) || fulfillment === "remote";
}

export function handoffSummary(listing: {
  fulfillment: Fulfillment;
  pickupPlace: string | null;
}): string {
  if (listing.fulfillment === "ship_prepaid") return "Shipping is free";
  if (listing.fulfillment === "ship") return "You cover postage";
  if (listing.fulfillment === "remote") return "Remote — no travel";
  if (listing.pickupPlace) return `Pickup · ${listing.pickupPlace}`;
  return FULFILLMENT_LABEL[listing.fulfillment];
}

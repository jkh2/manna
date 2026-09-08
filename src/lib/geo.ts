export function milesBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const r = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(s)));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function formatMiles(miles: number): string {
  if (miles < 0.5) return "a short walk";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export const RADIUS_STEPS = [
  { miles: 5, label: "Walking" },
  { miles: 15, label: "Nearby" },
  { miles: 25, label: "Town" },
  { miles: 50, label: "Valley" },
  { miles: 100, label: "Region" },
  { miles: 250, label: "State" },
  { miles: 3000, label: "United States" },
] as const;

export const LOCAL_CUTOFF_MILES = 80;

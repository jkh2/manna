import { milesBetween } from "@/lib/geo";

export type Place = {
  label: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
};

export const PLACES: Place[] = [
  { label: "Alamosa, CO", city: "Alamosa", region: "CO", lat: 37.4695, lng: -105.87 },
  { label: "Monte Vista, CO", city: "Monte Vista", region: "CO", lat: 37.5792, lng: -106.1481 },
  { label: "Del Norte, CO", city: "Del Norte", region: "CO", lat: 37.6792, lng: -106.3531 },
  { label: "Antonito, CO", city: "Antonito", region: "CO", lat: 37.0792, lng: -106.0086 },
  { label: "Salida, CO", city: "Salida", region: "CO", lat: 38.5347, lng: -105.9989 },
  { label: "Pueblo, CO", city: "Pueblo", region: "CO", lat: 38.2544, lng: -104.6091 },
  { label: "Colorado Springs, CO", city: "Colorado Springs", region: "CO", lat: 38.8339, lng: -104.8214 },
  { label: "Denver, CO", city: "Denver", region: "CO", lat: 39.7392, lng: -104.9903 },
  { label: "Boulder, CO", city: "Boulder", region: "CO", lat: 40.015, lng: -105.2705 },
  { label: "Fort Collins, CO", city: "Fort Collins", region: "CO", lat: 40.5853, lng: -105.0844 },
  { label: "Durango, CO", city: "Durango", region: "CO", lat: 37.2753, lng: -107.8801 },
  { label: "Santa Fe, NM", city: "Santa Fe", region: "NM", lat: 35.687, lng: -105.9378 },
  { label: "Albuquerque, NM", city: "Albuquerque", region: "NM", lat: 35.0844, lng: -106.6504 },
  { label: "Taos, NM", city: "Taos", region: "NM", lat: 36.4072, lng: -105.5731 },
  { label: "Phoenix, AZ", city: "Phoenix", region: "AZ", lat: 33.4484, lng: -112.074 },
  { label: "Salt Lake City, UT", city: "Salt Lake City", region: "UT", lat: 40.7608, lng: -111.891 },
  { label: "Austin, TX", city: "Austin", region: "TX", lat: 30.2672, lng: -97.7431 },
  { label: "Portland, OR", city: "Portland", region: "OR", lat: 45.5152, lng: -122.6784 },
  { label: "Seattle, WA", city: "Seattle", region: "WA", lat: 47.6062, lng: -122.3321 },
  { label: "Chicago, IL", city: "Chicago", region: "IL", lat: 41.8781, lng: -87.6298 },
  { label: "Atlanta, GA", city: "Atlanta", region: "GA", lat: 33.749, lng: -84.388 },
  { label: "Boston, MA", city: "Boston", region: "MA", lat: 42.3601, lng: -71.0589 },
  { label: "New York, NY", city: "New York", region: "NY", lat: 40.7128, lng: -74.006 },
  { label: "Minneapolis, MN", city: "Minneapolis", region: "MN", lat: 44.9778, lng: -93.265 },
];

export const DEFAULT_PLACE = PLACES[0]!;

export function nearestPlace(lat: number, lng: number): Place {
  let best = DEFAULT_PLACE;
  let bestMiles = Number.POSITIVE_INFINITY;
  for (const place of PLACES) {
    const miles = milesBetween(place, { lat, lng });
    if (miles < bestMiles) {
      best = place;
      bestMiles = miles;
    }
  }
  return best;
}

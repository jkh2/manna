import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PLACE, type Place } from "@/lib/places";

type PlaceState = {
  place: Place;
  radiusMiles: number;
  setPlace: (place: Place) => void;
  setRadiusMiles: (miles: number) => void;
};

export const usePlaceStore = create<PlaceState>()(
  persist(
    (set) => ({
      place: DEFAULT_PLACE,
      radiusMiles: 25,
      setPlace: (place) => set({ place }),
      setRadiusMiles: (radiusMiles) => set({ radiusMiles }),
    }),
    { name: "manna-place" },
  ),
);

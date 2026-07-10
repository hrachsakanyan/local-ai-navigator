import { useEffect, useMemo, useState } from "react";
import { mockPlaces, type MockPlace } from "@/lib/mockPlaces";
import type { Coords } from "@/lib/telegram";

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres between two coordinates (haversine). */
function distanceMeters(a: Coords, b: { lat: number; lng: number }): number {
  const R = 6_371_000; // Earth radius, metres
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Nearby places for a category, ranked by real distance from the user.
 *
 * MVP: filters hand-authored mock data and recomputes each place's distance
 * from `origin`. Swapped for the Google Places API later — the return shape
 * stays the same so the UI does not change.
 */
export function useNearbyPlaces(category: string, origin?: Coords) {
  const [loading, setLoading] = useState(true);

  const places = useMemo<MockPlace[]>(() => {
    return mockPlaces
      .filter((p) => p.category === category)
      .map((p) => ({ ...p, distanceM: origin ? Math.round(distanceMeters(origin, p)) : p.distanceM }))
      .sort((a, b) => a.distanceM - b.distanceM);
  }, [category, origin]);

  // Simulate a fetch so the skeleton state is exercised. Real API call later.
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [category, origin]);

  return { places, loading };
}

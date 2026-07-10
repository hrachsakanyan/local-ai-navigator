export function formatDistance(distanceM: number) {
  if (distanceM < 1000) {
    return `${Math.round(distanceM)} m`;
  }

  return `${(distanceM / 1000).toFixed(1)} km`;
}

// Rough walking time at ~80 m/min (about 4.8 km/h). Always at least 1 min so we
// never show "0 min walk" for a place that is right next door.
export function walkingEta(distanceM: number): string {
  const minutes = Math.max(1, Math.round(distanceM / 80));
  return `${minutes} min`;
}

// Google-style price level 0–4 → "$"…"$$$$". 0 or missing renders as nothing,
// so the caller can drop the segment entirely.
export function priceString(priceLevel?: number): string {
  if (!priceLevel || priceLevel < 1) return "";
  return "$".repeat(Math.min(Math.round(priceLevel), 4));
}

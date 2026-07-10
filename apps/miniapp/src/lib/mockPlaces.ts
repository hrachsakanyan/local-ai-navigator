export interface MockPlace {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  address: string;
  lat: number;
  lng: number;
  /** Seed distance from the city centre. The hook recomputes this from the
   *  user's real position, so this is only a fallback when no origin is known. */
  distanceM: number;
  tags: string[];
  openNow: boolean;
  /** Google-style price level 0–4. 0 means "not applicable" (e.g. a bank). */
  priceLevel: number;
  /** Photo of the place. Falls back to a tinted plate if it fails to load. */
  image: string;
}

// Public-domain-friendly Unsplash photos, sized down and cropped on the fly.
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

// Real Wikimedia Commons photos (e.g. the actual bank/pharmacy fronts in
// Yerevan). Special:FilePath returns a scaled thumbnail for us.
const wiki = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=800`;

// Hand-authored sample data around central Yerevan. Replaced by the Google
// Places API later — see useNearbyPlaces.
export const mockPlaces: MockPlace[] = [
  // ── Restaurants ──
  {
    id: "r1",
    name: "Lavash Restaurant",
    category: "restaurant",
    rating: 4.7,
    reviews: 2140,
    address: "5 Tumanyan St, Yerevan",
    lat: 40.1815,
    lng: 44.5142,
    distanceM: 420,
    tags: ["Armenian", "Traditional", "Dinner"],
    openNow: true,
    priceLevel: 2,
    image: img("1517248135467-4c7edcad34c4"),
  },
  {
    id: "r2",
    name: "Sherep",
    category: "restaurant",
    rating: 4.6,
    reviews: 1560,
    address: "1 Amiryan St, Yerevan",
    lat: 40.1789,
    lng: 44.5103,
    distanceM: 780,
    tags: ["Armenian", "Modern", "Wine"],
    openNow: true,
    priceLevel: 3,
    image: img("1414235077428-338989a2e8c0"),
  },
  {
    id: "r3",
    name: "Tsirani",
    category: "restaurant",
    rating: 4.4,
    reviews: 640,
    address: "3 Sayat-Nova Ave, Yerevan",
    lat: 40.1841,
    lng: 44.5169,
    distanceM: 1120,
    tags: ["Grill", "Family"],
    openNow: false,
    priceLevel: 2,
    image: img("1544025162-d76694265947"),
  },

  // ── Cafes ──
  {
    id: "c1",
    name: "Yerevan Cafe",
    category: "cafe",
    rating: 4.8,
    reviews: 980,
    address: "Kentron, Yerevan",
    lat: 40.1772,
    lng: 44.5035,
    distanceM: 350,
    tags: ["Coffee", "Breakfast", "Wi-Fi"],
    openNow: true,
    priceLevel: 1,
    image: img("1554118811-1e0d58224f24"),
  },
  {
    id: "c2",
    name: "Green Bean",
    category: "cafe",
    rating: 4.5,
    reviews: 720,
    address: "12 Abovyan St, Yerevan",
    lat: 40.1808,
    lng: 44.5157,
    distanceM: 610,
    tags: ["Specialty coffee", "Vegan"],
    openNow: true,
    priceLevel: 2,
    image: img("1495474472287-4d71bcdd2085"),
  },
  {
    id: "c3",
    name: "Coffeeshop Company",
    category: "cafe",
    rating: 4.3,
    reviews: 1310,
    address: "2 Northern Ave, Yerevan",
    lat: 40.1796,
    lng: 44.5148,
    distanceM: 540,
    tags: ["Coffee", "Desserts"],
    openNow: false,
    priceLevel: 2,
    image: img("1461023058943-07fcbe16d735"),
  },

  // ── Banks ──
  {
    id: "b1",
    name: "Ameriabank",
    category: "bank",
    rating: 4.2,
    reviews: 210,
    address: "9 Grigor Lusavorich St, Yerevan",
    lat: 40.1758,
    lng: 44.5061,
    distanceM: 460,
    tags: ["ATM", "Currency exchange"],
    openNow: true,
    priceLevel: 0,
    image: wiki("Ameriabank Yerevan.jpg"),
  },
  {
    id: "b2",
    name: "Acba Bank",
    category: "bank",
    rating: 4.0,
    reviews: 145,
    address: "1 Byron St, Yerevan",
    lat: 40.1834,
    lng: 44.5121,
    distanceM: 890,
    tags: ["ATM", "24/7 ATM"],
    openNow: true,
    priceLevel: 0,
    image: wiki("Acba-bank-kentron.jpg"),
  },

  // ── Pharmacies ──
  {
    id: "p1",
    name: "City Pharmacy",
    category: "pharmacy",
    rating: 4.5,
    reviews: 320,
    address: "Abovyan Street, Yerevan",
    lat: 40.1810,
    lng: 44.5160,
    distanceM: 900,
    tags: ["24/7", "Prescriptions"],
    openNow: true,
    priceLevel: 1,
    image: wiki("Pharmacie Baghramyan Avenue (June 2023).JPG"),
  },
  {
    id: "p2",
    name: "Alfa Pharm",
    category: "pharmacy",
    rating: 4.1,
    reviews: 190,
    address: "20 Mashtots Ave, Yerevan",
    lat: 40.1839,
    lng: 44.5087,
    distanceM: 1050,
    tags: ["Cosmetics", "Prescriptions"],
    openNow: false,
    priceLevel: 1,
    image: wiki("Apoteko en Erevano.jpg"),
  },
];

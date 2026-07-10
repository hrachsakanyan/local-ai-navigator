import { Utensils, Coffee, Landmark, Pill } from "lucide-react";

// Every lucide icon shares this exact type; deriving it from one icon keeps us
// independent of how the installed lucide-react version names its export.
type IconType = typeof Utensils;

export interface Category {
  id: string;
  label: string;
  icon: IconType;
  /** CSS custom property (defined in globals.css) used to tint this category. */
  colorVar: string;
}

export const CATEGORIES: Category[] = [
  { id: "restaurant", label: "Restaurants", icon: Utensils, colorVar: "--c-restaurant" },
  { id: "cafe", label: "Cafes", icon: Coffee, colorVar: "--c-cafe" },
  { id: "bank", label: "Banks", icon: Landmark, colorVar: "--c-bank" },
  { id: "pharmacy", label: "Pharmacies", icon: Pill, colorVar: "--c-pharmacy" },
];

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

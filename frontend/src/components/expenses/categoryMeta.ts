import { Utensils, Plane, Bed, ShoppingBag, Fuel, Ticket, Siren, Clapperboard, Shapes, LucideIcon } from "lucide-react";

export const CATEGORY_META: Record<string, { icon: LucideIcon; color: string }> = {
  Food: { icon: Utensils, color: "#F59E0B" },
  Travel: { icon: Plane, color: "#60A5FA" },
  Accommodation: { icon: Bed, color: "#A78BFA" },
  Shopping: { icon: ShoppingBag, color: "#F472B6" },
  Fuel: { icon: Fuel, color: "#FB923C" },
  Activities: { icon: Ticket, color: "#34D399" },
  Emergency: { icon: Siren, color: "#F87171" },
  Entertainment: { icon: Clapperboard, color: "#818CF8" },
  Miscellaneous: { icon: Shapes, color: "#9CA3AF" },
};

export function getCategoryMeta(category: string) {
  return CATEGORY_META[category] || CATEGORY_META.Miscellaneous;
}

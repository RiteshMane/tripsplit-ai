import { cn, initials, avatarColor } from "@/lib/utils";

export function Avatar({ name, src, size = "md", className }: { name: string; src?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-14 w-14 text-base" };
  if (src) {
    return <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size], className)} />;
  }
  return (
    <div
      className={cn("flex items-center justify-center rounded-full font-semibold text-white/90 ring-1 ring-white/10", sizes[size], className)}
      style={{ backgroundColor: avatarColor(name) + "33", color: avatarColor(name) }}
    >
      {initials(name || "?")}
    </div>
  );
}

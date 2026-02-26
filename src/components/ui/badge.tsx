import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "pioneer" | "muted";

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-border text-foreground",
  pioneer:
    "border-accent-emerald/30 bg-accent-emerald/10 text-accent-emerald",
  muted: "border-border bg-border/50 text-muted",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

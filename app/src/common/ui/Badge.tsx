import { cn } from "@/app/src/core/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#bfc8ca] text-[#171d1e]",
  success: "bg-[#b3f5ed] text-[#003832]",
  warning: "bg-[#ffedb3] text-[#3d2e00]",
  error: "bg-[#ffdad6] text-[#8c0d0d]",
  info: "bg-[#dbe1ff] text-[#000b5e]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-[family-name:var(--font-nunito)]",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

"use client";

import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/app/src/core/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#00CFBB] text-white hover:bg-[#00b8a6] active:bg-[#00a390] shadow-sm",
  secondary:
    "bg-[#1C258F] text-white hover:bg-[#151d72] active:bg-[#0f1557] shadow-sm",
  outline:
    "border-2 border-[#1C258F] text-[#1C258F] hover:bg-[#dbe1ff] active:bg-[#b6c4ff]",
  ghost:
    "text-[#1C258F] hover:bg-[#dbe1ff] active:bg-[#b6c4ff]",
  danger:
    "bg-[#ba1a1a] text-white hover:bg-[#a01515] active:bg-[#861010] shadow-sm",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-[family-name:var(--font-nunito)] font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

import { type ReactNode } from "react";
import { cn } from "@/app/src/core/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white shadow-[0_3px_6px_rgba(0,0,0,0.05)] border border-[#bfc8ca]/40",
        padding && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

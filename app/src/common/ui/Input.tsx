"use client";

import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/src/core/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#1C258F] font-[family-name:var(--font-nunito)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border-2 border-[#bfc8ca] bg-white px-4 py-2.5 text-sm text-[#171d1e] font-[family-name:var(--font-nunito)] placeholder:text-[#6f797a] outline-none transition-colors focus:border-[#1C258F] focus:ring-2 focus:ring-[#dbe1ff]",
            error && "border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ffdad6]",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#ba1a1a] font-[family-name:var(--font-nunito)]">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type, ...props }, ref) => {
    const isTel = type === "tel";
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          dir={isTel ? "ltr" : undefined}
          className={cn(
            "w-full px-3 py-2.5 rounded-lg border text-base tap-target",
            "bg-white border-slate-300 placeholder:text-slate-400",
            "focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
            "transition-colors",
            error && "border-danger focus:border-danger focus:ring-danger",
            isTel && "text-start",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };

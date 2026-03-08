"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className={cn(
            "flex items-start gap-3 cursor-pointer tap-target",
            className
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary shrink-0"
            {...props}
          />
          {label && (
            <span className="text-sm text-slate-700 leading-relaxed">
              {label}
            </span>
          )}
        </label>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export { Checkbox };

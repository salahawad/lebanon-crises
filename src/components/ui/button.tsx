"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary tap-target disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark",
      secondary: "bg-white text-primary border-2 border-primary hover:bg-primary/5",
      outline: "border border-border text-heading hover:border-primary hover:text-primary",
      ghost: "text-primary hover:bg-primary/5",
      danger: "bg-danger-dark text-white hover:bg-danger-dark",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm min-h-[44px]",
      md: "px-4 py-2.5 text-base min-h-[44px]",
      lg: "px-6 py-3 text-lg min-h-[48px]",
      xl: "px-8 py-4 text-xl min-h-[56px] w-full",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };

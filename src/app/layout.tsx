import type { ReactNode } from "react";

// Minimal root layout — locale-specific layout handles everything
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

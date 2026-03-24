import { redirect } from "next/navigation";

// The platform dashboard lives at /{locale}/platform
// This file would conflict with the root landing page at src/app/[locale]/page.tsx
// Redirect to the correct path if somehow reached
export default function PlatformRootRedirect() {
  redirect("platform");
}

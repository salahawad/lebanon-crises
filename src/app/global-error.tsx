"use client";

import { useEffect } from "react";
import { createLogger } from "@/lib/logger";

const log = createLogger("error-boundary:global");

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error("unhandled global error", error, { digest: error.digest });
  }, [error]);
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-6xl block mb-4" aria-hidden="true">
            &#x26A0;&#xFE0F;
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-500 mb-6 text-sm">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 px-6 py-3 rounded-xl bg-[#1e3a5f] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

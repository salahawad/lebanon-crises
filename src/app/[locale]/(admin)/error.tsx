"use client";

import { useEffect } from "react";
import { createLogger } from "@/lib/logger";

const log = createLogger("error-boundary:admin");

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error("unhandled admin error", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-5xl block mb-4" aria-hidden="true">
          &#x26A0;&#xFE0F;
        </span>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Admin Error
        </h2>
        <p className="text-slate-500 mb-4 text-sm">
          The admin panel encountered an error. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 px-6 py-3 rounded-xl bg-[#1e3a5f] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

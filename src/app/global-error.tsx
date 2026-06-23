"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-[#07050f] text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-4 rounded-xl bg-violet-600 px-6 py-2"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

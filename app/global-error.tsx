"use client";

import { useEffect } from "react";
import { DysenteryGraphic } from "@/components/DysenteryGraphic";
import "./globals.css";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-trail">
        <main className="min-h-screen bg-black px-3 py-6 text-trail-ink sm:px-6 lg:py-10">
          <div className="crt-screen mx-auto max-w-4xl bg-trail-green p-4 shadow-crt sm:p-8">
            <DysenteryGraphic
              message="The whole trail failed to load. Try again to hitch the wagon."
              action={
                <button
                  type="button"
                  onClick={reset}
                  className="pixel-border bg-trail-panel px-5 py-2 text-2xl uppercase leading-none text-trail-ink transition hover:bg-white"
                >
                  Restart Trail
                </button>
              }
            />
          </div>
        </main>
      </body>
    </html>
  );
}

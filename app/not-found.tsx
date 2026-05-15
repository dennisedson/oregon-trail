import Link from "next/link";
import { DysenteryGraphic } from "@/components/DysenteryGraphic";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black px-3 py-6 text-trail-ink sm:px-6 lg:py-10">
      <div className="crt-screen mx-auto max-w-4xl bg-trail-green p-4 shadow-crt sm:p-8">
        <DysenteryGraphic
          title="This trail has died of dysentery"
          message="The route you requested is not in the wagon manifest."
          action={
            <Link
              href="/"
              className="pixel-border inline-block bg-trail-panel px-5 py-2 text-2xl uppercase leading-none text-trail-ink transition hover:bg-white"
            >
              Return To Trail
            </Link>
          }
        />
      </div>
    </main>
  );
}

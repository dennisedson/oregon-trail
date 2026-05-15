import { Map } from "lucide-react";
import { MILESTONES, type TrailGameState } from "@/lib/game-state";

export function TrailMap({ state }: { state: TrailGameState }) {
  const milestone = MILESTONES[state.currentMilestone];
  const progress = milestone.progress;
  const isGameOver = state.currentMilestone === "dysentery";

  return (
    <section className="pixel-border bg-trail-panel p-4">
      <div className="mb-3 flex items-start justify-between gap-4 text-2xl font-bold uppercase leading-none">
        <div>
          <p>{milestone.title}</p>
          <p className="text-xl font-normal">{milestone.location}</p>
        </div>
        <Map aria-hidden="true" className="h-7 w-7 shrink-0" />
      </div>
      <div className="pixel-border relative h-9 overflow-hidden bg-[#e8ebef]">
        <div
          className={`h-full ${isGameOver ? "bg-trail-danger" : "bg-trail-green"}`}
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
          {progress}%
        </div>
      </div>
      <div className="mt-3 grid grid-cols-5 items-center gap-2">
        {[0, 1, 2, 3, 4].map((tick) => (
          <div key={tick} className="flex items-center">
            <span className="h-4 w-2 bg-trail-ink" />
            <span className="h-px flex-1 bg-trail-ink/50" />
          </div>
        ))}
      </div>
    </section>
  );
}

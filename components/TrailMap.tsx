import { Map } from "lucide-react";
import { MILESTONES, type MilestoneId, type TrailGameState } from "@/lib/game-state";

const routeStops: Array<{
  id: MilestoneId;
  label: string;
  progress: number;
}> = [
  { id: "starting_outpost", label: "Outpost", progress: 10 },
  { id: "high_plains", label: "High Plains", progress: 38 },
  { id: "river_crossing", label: "River", progress: 64 },
  { id: "anthropic_valley", label: "Valley", progress: 88 },
  { id: "offer_camp", label: "Offer", progress: 100 }
];

export function TrailMap({
  state,
  motionId
}: {
  state: TrailGameState;
  motionId: number;
}) {
  const milestone = MILESTONES[state.currentMilestone];
  const progress = milestone.progress;
  const isGameOver = state.currentMilestone === "dysentery";
  const markerProgress = isGameOver ? 4 : progress;

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
      <div className="trail-map-board mt-4" aria-label="Trail map">
        <div className="trail-route-line">
          {routeStops.map((stop) => {
            const isPassed = progress >= stop.progress && !isGameOver;
            const isCurrent = state.currentMilestone === stop.id;

            return (
              <span
                key={stop.id}
                className={`trail-route-stop ${
                  isPassed ? "trail-route-stop-passed" : ""
                } ${isCurrent ? "trail-route-stop-current" : ""}`}
                style={{ left: `${stop.progress}%` }}
                title={stop.label}
              />
            );
          })}
          <span
            className="trail-wagon-marker"
            style={{ left: `${markerProgress}%` }}
          >
            <span
              key={motionId}
              className={`trail-wagon-token ${
                motionId > 0 ? "trail-wagon-token-moving" : ""
              }`}
            >
              <span className="trail-wagon-body" />
              <span className="trail-wagon-wheel trail-wagon-wheel-left" />
              <span className="trail-wagon-wheel trail-wagon-wheel-right" />
            </span>
          </span>
        </div>
        <div className="mt-4 flex justify-between gap-2 text-lg uppercase leading-none">
          <span>Independence</span>
          <span>Anthropic Valley</span>
        </div>
      </div>
    </section>
  );
}

import { ArrowRight } from "lucide-react";
import type { TrailAction, TrailActionId } from "@/lib/game-state";

export function CommandDeck({
  actions,
  pendingAction,
  onAction
}: {
  actions: TrailAction[];
  pendingAction: TrailActionId | null;
  onAction: (actionId: TrailActionId) => void;
}) {
  if (actions.length === 0) {
    return (
      <section className="pixel-border bg-trail-panel p-4 text-2xl">
        The trail is complete. The ledger awaits the hiring decision.
      </section>
    );
  }

  return (
    <section className="space-y-3" aria-label="Command deck">
      {actions.map((action, index) => {
        const isPending = pendingAction === action.id;

        return (
          <button
            key={action.id}
            type="button"
            disabled={Boolean(pendingAction)}
            onClick={() => onAction(action.id)}
            className="pixel-border group flex w-full items-center justify-between gap-4 bg-trail-panel px-4 py-3 text-left uppercase transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-wait disabled:opacity-70"
          >
            <span className="min-w-0">
              <span className="block text-2xl leading-none">
                {index + 1}. {isPending ? "Sending Telegraph" : action.label}
              </span>
              <span className="mt-1 block text-xl leading-none text-trail-darkGreen">
                {isPending ? action.cue : action.cue}
              </span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="h-7 w-7 shrink-0 transition group-hover:translate-x-1"
            />
          </button>
        );
      })}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { CommandDeck } from "@/components/CommandDeck";
import {
  DeveloperConsole,
  type DeveloperReport
} from "@/components/DeveloperConsole";
import { ResourceBar } from "@/components/ResourceBar";
import { TrailMap } from "@/components/TrailMap";
import {
  getActionsForState,
  initialTrailState,
  MILESTONES,
  type TrailAction,
  type TrailActionId,
  type TrailGameState
} from "@/lib/game-state";

type TrailApiResponse = {
  sessionId: string;
  state: TrailGameState;
  narrative: string;
  actions: TrailAction[];
  developer: DeveloperReport;
};

const initialDeveloperReport: DeveloperReport = {
  mode: "local-shell",
  model: "claude-sonnet-4-6",
  systemPrompt: "System prompt loads after the first trail action.",
  debugNotes: [
    "The shell is ready. Add bio.md and credentials to move from demo to live narration."
  ],
  warnings: ["bio.md has not been found in the project root yet."]
};

export function GameShell() {
  const [sessionId, setSessionId] = useState("pending");
  const [state, setState] = useState<TrailGameState>(initialTrailState);
  const [narrative, setNarrative] = useState(
    "The hiring manager reaches Independence, MO, where a green-screen guide waits beside a well-labeled wagon. The trail is pointed toward Anthropic Valley, but the candidate manifest must be loaded before the guide can cite real provisions."
  );
  const [developerReport, setDeveloperReport] = useState<DeveloperReport>(
    initialDeveloperReport
  );
  const [actions, setActions] = useState(() => getActionsForState(initialTrailState));
  const [pendingAction, setPendingAction] = useState<TrailActionId | null>(null);

  const milestone = MILESTONES[state.currentMilestone];
  const gameOver = state.currentMilestone === "dysentery";
  const wagonStatus = useMemo(() => {
    if (gameOver) {
      return "DYSENTERY";
    }

    if (state.currentMilestone === "offer_camp") {
      return "READY";
    }

    return state.resources.techDebt > 70 ? "RISKY" : "GOOD";
  }, [gameOver, state.currentMilestone, state.resources.techDebt]);

  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  async function handleAction(actionId: TrailActionId) {
    setPendingAction(actionId);

    try {
      const response = await fetch("/api/trail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          actionId,
          state
        })
      });

      const data = (await response.json()) as TrailApiResponse;

      if (!response.ok) {
        throw new Error("Wagon axle broken: the trail API refused the command.");
      }

      setSessionId(data.sessionId);
      setState(data.state);
      setNarrative(data.narrative);
      setActions(data.actions);
      setDeveloperReport(data.developer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown trail failure.";

      setNarrative(
        `${message} The party circles the wagons and keeps the local shell intact.`
      );
      setDeveloperReport((current) => ({
        ...current,
        warnings: [message, ...current.warnings].slice(0, 5)
      }));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-trail-ink sm:px-6 lg:py-10">
      <div className="crt-screen mx-auto max-w-5xl bg-trail-green p-4 shadow-crt sm:p-8">
        <header className="border-b-8 border-black pb-4 text-center">
          <h1 className="text-4xl uppercase leading-none sm:text-5xl">
            The Anthropic Trail
          </h1>
        </header>

        <div className="space-y-4 pt-4">
          <ResourceBar resources={state.resources} />
          <TrailMap state={state} />

          <section className="grid items-center gap-5 py-5 text-center">
            <div className="wagon mx-auto h-24 w-40" aria-hidden="true">
              <svg viewBox="0 0 160 96" role="img" className="h-full w-full">
                <rect x="18" y="44" width="124" height="30" fill="#7a4618" stroke="#000" strokeWidth="4" />
                <path d="M28 44 C45 18 111 18 132 44" fill="#9c5d20" stroke="#000" strokeWidth="4" />
                <line x1="56" y1="44" x2="56" y2="74" stroke="#000" strokeWidth="3" />
                <line x1="88" y1="44" x2="88" y2="74" stroke="#000" strokeWidth="3" />
                <circle cx="42" cy="78" r="13" fill="#542f15" stroke="#000" strokeWidth="4" />
                <circle cx="118" cy="78" r="13" fill="#542f15" stroke="#000" strokeWidth="4" />
                <circle cx="42" cy="78" r="7" fill="#a45e1d" stroke="#000" strokeWidth="3" />
                <circle cx="118" cy="78" r="7" fill="#a45e1d" stroke="#000" strokeWidth="3" />
              </svg>
            </div>

            <div className="mx-auto w-full max-w-4xl border-4 border-trail-warning bg-trail-paper p-4">
              <p className="mx-auto mb-3 w-fit bg-black px-5 py-1 text-2xl uppercase text-trail-green">
                {milestone.title}
              </p>
              <p className="terminal-text max-h-96 overflow-auto pr-2 text-2xl leading-tight sm:text-3xl">
                {gameOver
                  ? "You have died of dysentery. The trail records cite excess technical debt."
                  : narrative}
              </p>
            </div>
          </section>

          <section className="pixel-border bg-trail-panel p-4 text-2xl">
            <p className="mb-3 uppercase">You may:</p>
            <CommandDeck
              actions={actions}
              pendingAction={pendingAction}
              onAction={handleAction}
            />
          </section>

          <section className="pixel-border bg-trail-panel p-4">
            <h2 className="mb-3 text-3xl font-bold uppercase">Current Supplies</h2>
            <div className="grid gap-2 text-2xl sm:grid-cols-2">
              <p className="border-b-2 border-dotted border-black">
                Wagon Status <strong className="float-right">{wagonStatus}</strong>
              </p>
              <p className="border-b-2 border-dotted border-black">
                Trail Phase <strong className="float-right">{milestone.location}</strong>
              </p>
              <p className="border-b-2 border-dotted border-black">
                Session <strong className="float-right">{sessionId.slice(0, 8)}</strong>
              </p>
              <p className="border-b-2 border-dotted border-black">
                Log Entries <strong className="float-right">{state.log.length}</strong>
              </p>
            </div>
            {state.log.length > 0 ? (
              <ol className="mt-4 space-y-2 text-xl">
                {state.log.map((entry) => (
                  <li key={entry.id} className="border-t-2 border-dotted border-black pt-2">
                    {entry.label}: {entry.detail}
                  </li>
                ))}
              </ol>
            ) : null}
          </section>

          <DeveloperConsole report={developerReport} />

          <footer className="border-t-4 border-black pt-4 text-center text-2xl uppercase">
            Anthropic Valley: 2,040 Miles / Trail Guide Standing By
          </footer>
        </div>
      </div>
    </main>
  );
}

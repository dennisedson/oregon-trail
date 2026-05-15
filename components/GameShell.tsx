"use client";

import { ExternalLink, Mail, RotateCcw } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
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

type TrailStatusResponse = {
  developer: DeveloperReport;
};

const initialDeveloperReport: DeveloperReport = {
  mode: "checking",
  model: "claude-sonnet-4-6",
  systemPrompt: "System prompt loads after the startup check.",
  debugNotes: ["Checking trail manifest and telegraph line."],
  warnings: []
};

const openingNarrative =
  "The hiring manager reaches Independence, MO, where a green-screen guide waits beside a well-labeled wagon. The trail is pointed toward Anthropic Valley, but the candidate manifest must be loaded before the guide can cite real provisions.";

const contactHandleParts = ["dennis", "dennisedson", "com"];

export function GameShell() {
  const [sessionId, setSessionId] = useState("pending");
  const [state, setState] = useState<TrailGameState>(initialTrailState);
  const [narrative, setNarrative] = useState(openingNarrative);
  const [developerReport, setDeveloperReport] = useState<DeveloperReport>(
    initialDeveloperReport
  );
  const [actions, setActions] = useState(() => getActionsForState(initialTrailState));
  const [pendingAction, setPendingAction] = useState<TrailActionId | null>(null);
  const [wagonMotionId, setWagonMotionId] = useState(0);

  const milestone = MILESTONES[state.currentMilestone];
  const gameOver = state.currentMilestone === "dysentery";
  const pendingTrailAction = pendingAction
    ? actions.find((action) => action.id === pendingAction)
    : null;
  const pendingActionLabel = pendingTrailAction?.label ?? "Trail Decision";
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

  useEffect(() => {
    let isMounted = true;

    async function loadTrailStatus() {
      try {
        const response = await fetch("/api/trail");
        const data = (await response.json()) as TrailStatusResponse;

        if (!response.ok) {
          throw new Error("Wagon manifest check failed.");
        }

        if (isMounted) {
          setDeveloperReport(data.developer);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown trail status failure.";

        if (isMounted) {
          setDeveloperReport((current) => ({
            ...current,
            mode: "status-error",
            warnings: [message]
          }));
        }
      }
    }

    loadTrailStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAction(actionId: TrailActionId) {
    setPendingAction(actionId);
    setWagonMotionId((motionId) => motionId + 1);

    try {
      const activeSessionId =
        sessionId === "pending" ? crypto.randomUUID() : sessionId;

      const response = await fetch("/api/trail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
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

  function restartTrail() {
    setSessionId(crypto.randomUUID());
    setState(initialTrailState);
    setNarrative(openingNarrative);
    setActions(getActionsForState(initialTrailState));
    setPendingAction(null);
    setWagonMotionId((motionId) => motionId + 1);
  }

  function openEmail() {
    const [name, domain, tld] = contactHandleParts;
    window.location.href = `mailto:${name}@${domain}.${tld}`;
  }

  return (
    <main className="min-h-screen bg-black px-3 py-6 text-trail-ink sm:px-6 lg:py-10">
      <div className="crt-screen mx-auto max-w-7xl bg-trail-green p-4 shadow-crt sm:p-8">
        <header className="border-b-8 border-black pb-4 text-center">
          <h1 className="text-5xl uppercase leading-none sm:text-7xl lg:text-8xl">
            Dennis Edson's
          </h1>
          <p className="mt-2 text-3xl uppercase leading-none sm:text-4xl">
            The Anthropic Trail
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-2xl uppercase">
            <button
              type="button"
              onClick={openEmail}
              className="pixel-border inline-flex items-center gap-2 bg-trail-panel px-3 py-2 leading-none transition hover:bg-white"
            >
              <Mail aria-hidden="true" className="h-6 w-6" />
              Send Telegraph
            </button>
            <a
              href="https://www.linkedin.com/in/dennisedson"
              target="_blank"
              rel="noreferrer"
              className="pixel-border inline-flex items-center gap-2 bg-trail-panel px-3 py-2 leading-none text-trail-ink transition hover:bg-white"
            >
              <ExternalLink aria-hidden="true" className="h-6 w-6" />
              LinkedIn
            </a>
          </div>
        </header>

        <div className="space-y-4 pt-4">
          <ResourceBar resources={state.resources} />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-start">
            <div className="space-y-4">
              <TrailMap state={state} motionId={wagonMotionId} />

              <section className="grid items-center gap-4 py-4 text-center lg:py-2">
                <div
                  key={wagonMotionId}
                  className={`wagon mx-auto h-24 w-40 lg:h-20 lg:w-32 ${
                    wagonMotionId > 0 ? "wagon-moving" : ""
                  }`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 160 96" role="img" className="h-full w-full">
                    <rect x="18" y="44" width="124" height="30" fill="#7a4618" stroke="#000" strokeWidth="4" />
                    <path d="M28 44 C45 18 111 18 132 44" fill="#9c5d20" stroke="#000" strokeWidth="4" />
                    <line x1="56" y1="44" x2="56" y2="74" stroke="#000" strokeWidth="3" />
                    <line x1="88" y1="44" x2="88" y2="74" stroke="#000" strokeWidth="3" />
                    <g className="wagon-wheel">
                      <circle cx="42" cy="78" r="13" fill="#542f15" stroke="#000" strokeWidth="4" />
                      <circle cx="42" cy="78" r="7" fill="#a45e1d" stroke="#000" strokeWidth="3" />
                      <line x1="42" y1="65" x2="42" y2="91" stroke="#000" strokeWidth="2" />
                      <line x1="29" y1="78" x2="55" y2="78" stroke="#000" strokeWidth="2" />
                    </g>
                    <g className="wagon-wheel">
                      <circle cx="118" cy="78" r="13" fill="#542f15" stroke="#000" strokeWidth="4" />
                      <circle cx="118" cy="78" r="7" fill="#a45e1d" stroke="#000" strokeWidth="3" />
                      <line x1="118" y1="65" x2="118" y2="91" stroke="#000" strokeWidth="2" />
                      <line x1="105" y1="78" x2="131" y2="78" stroke="#000" strokeWidth="2" />
                    </g>
                  </svg>
                  <span className="wagon-dust wagon-dust-one" />
                  <span className="wagon-dust wagon-dust-two" />
                  <span className="wagon-dust wagon-dust-three" />
                </div>

                <div className="mx-auto w-full border-4 border-trail-warning bg-trail-paper p-4">
                  <p className="mx-auto mb-3 w-fit bg-black px-5 py-1 text-2xl uppercase text-trail-green">
                    {milestone.title}
                  </p>
                  {pendingAction ? (
                    <div
                      className="trail-response-loading mx-auto max-w-3xl"
                      role="status"
                      aria-live="polite"
                    >
                      <p className="text-3xl uppercase leading-none">Sending Telegraph</p>
                      <div className="telegraph-signal" aria-hidden="true">
                        {Array.from({ length: 9 }).map((_, index) => (
                          <span
                            key={index}
                            style={
                              {
                                "--pulse-index": index
                              } as CSSProperties
                            }
                          />
                        ))}
                      </div>
                      <p className="trail-loading-copy text-2xl leading-tight sm:text-3xl lg:text-2xl">
                        The guide is checking the wagon manifest for{" "}
                        <strong>{pendingActionLabel}</strong>.
                      </p>
                      <p className="trail-loading-dots text-2xl uppercase">
                        Awaiting Reply
                      </p>
                    </div>
                  ) : (
                    <p className="terminal-text max-h-96 overflow-auto pr-2 text-2xl leading-tight sm:text-3xl lg:max-h-[24rem] lg:text-2xl xl:text-3xl">
                      {gameOver
                        ? "You have died of dysentery. The trail records cite excess technical debt."
                        : narrative}
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-4 lg:sticky lg:top-6">
              <section className="pixel-border bg-trail-panel p-4 text-2xl">
                <p className="mb-3 uppercase">You may:</p>
                <CommandDeck
                  actions={actions}
                  pendingAction={pendingAction}
                  onAction={handleAction}
                />
              </section>

              <section className="pixel-border bg-trail-panel p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-3xl font-bold uppercase">Current Supplies</h2>
                  <button
                    type="button"
                    onClick={restartTrail}
                    disabled={Boolean(pendingAction)}
                    className="pixel-border inline-flex items-center gap-2 bg-trail-panel px-3 py-2 text-2xl uppercase leading-none transition hover:bg-white disabled:cursor-wait disabled:opacity-70"
                  >
                    <RotateCcw aria-hidden="true" className="h-6 w-6" />
                    Start Over
                  </button>
                </div>
                <div className="grid gap-2 text-2xl sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
                  <ol className="mt-4 max-h-48 space-y-2 overflow-auto pr-2 text-xl">
                    {state.log.map((entry) => (
                      <li key={entry.id} className="border-t-2 border-dotted border-black pt-2">
                        {entry.label}: {entry.detail}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </section>
            </div>
          </div>

          <DeveloperConsole report={developerReport} />

          <footer className="border-t-4 border-black pt-4 text-center text-2xl uppercase">
            Anthropic Valley: 2,040 Miles / Trail Guide Standing By
          </footer>
        </div>
      </div>
    </main>
  );
}

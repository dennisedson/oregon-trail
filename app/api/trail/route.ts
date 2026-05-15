import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  applyActionToState,
  getActionById,
  getActionsForState,
  initialTrailState,
  MILESTONES,
  type TrailAction,
  type TrailActionId,
  type TrailGameState
} from "@/lib/game-state";
import {
  buildTrailUserPrompt,
  CLAUDE_MODEL,
  TRAIL_SYSTEM_PROMPT
} from "@/lib/prompts";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type TrailRequest = {
  sessionId?: string;
  actionId?: TrailActionId;
  state?: TrailGameState;
};

type ClaudeTrailPayload = {
  narrative?: string;
  debugNotes?: string[];
  mode?: "live-claude" | "demo";
};

const MAX_REQUEST_BYTES = 32_768;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

export async function GET() {
  const warnings: string[] = [];
  const debugNotes: string[] = [];
  const bioResult = await loadBioManifest();
  const liveNarrationAvailable = Boolean(process.env.ANTHROPIC_API_KEY && bioResult.bio);

  if (bioResult.bio) {
    debugNotes.push("Candidate manifest is available for trail narration.");
  } else {
    warnings.push("Candidate manifest is unavailable. The wagon is using fallback narration.");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    warnings.push("Live trail narration is unavailable. Local narration is enabled.");
  }

  if (!getServerSupabaseClient()) {
    warnings.push("Trail journal saves are disabled for this run.");
  }

  return NextResponse.json({
    developer: {
      mode: liveNarrationAvailable ? "live trail guide" : "local fallback",
      model: CLAUDE_MODEL,
      debugNotes,
      warnings
    }
  });
}

export async function POST(request: Request) {
  const warnings: string[] = [];
  const sizeCheck = checkRequestSize(request);

  if (sizeCheck) {
    return sizeCheck;
  }

  const rateLimit = checkRateLimit(getClientKey(request));

  if (rateLimit.limited) {
    return NextResponse.json(
      {
        error: "The trail is crowded. Try this crossing again shortly.",
        code: "TRAIL_RATE_LIMITED"
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      }
    );
  }

  const body = (await request.json().catch(() => null)) as TrailRequest | null;
  const sessionId = body?.sessionId || crypto.randomUUID();
  const state = normalizeTrailState(body?.state);

  if (!body?.actionId) {
    return NextResponse.json(
      { error: "Missing trail action.", code: "WAGON_MANIFEST_INCOMPLETE" },
      { status: 400 }
    );
  }

  let action: TrailAction;
  try {
    action = getActionById(body.actionId);
  } catch {
    return NextResponse.json(
      { error: "Unknown trail action.", code: "BAD_TRAIL_SIGN" },
      { status: 400 }
    );
  }

  const nextState = applyActionToState(state, action);
  const bioResult = await loadBioManifest();

  if (!bioResult.bio) {
    warnings.push("Candidate manifest is unavailable. The wagon is using fallback narration.");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    warnings.push("Live trail narration is unavailable. Local narration is enabled.");
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) {
    warnings.push("Trail journal saves are disabled for this run.");
  }

  const liveMode = Boolean(process.env.ANTHROPIC_API_KEY && bioResult.bio);
  const payload = liveMode
    ? await askClaude({ action, state: nextState, bio: bioResult.bio!, warnings })
    : buildDemoPayload(action, nextState, warnings);

  if (supabase) {
    const { error } = await supabase.from("trail_sessions").upsert({
      session_id: sessionId,
      current_milestone: nextState.currentMilestone,
      resources: nextState.resources,
      log: nextState.log,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error("Trail journal save failed", error);
      warnings.push("Trail journal save failed for this turn.");
    }
  }

  return NextResponse.json({
    sessionId,
    state: nextState,
    narrative: payload.narrative,
    actions: getActionsForState(nextState),
    developer: {
      mode: payload.mode === "live-claude" ? "live trail guide" : "local fallback",
      model: CLAUDE_MODEL,
      debugNotes: payload.debugNotes,
      warnings
    }
  });
}

async function askClaude({
  action,
  state,
  bio,
  warnings
}: {
  action: TrailAction;
  state: TrailGameState;
  bio: string;
  warnings: string[];
}): Promise<Required<ClaudeTrailPayload>> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 900,
      temperature: 0.7,
      system: TRAIL_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildTrailUserPrompt({ bio, action, state })
        }
      ]
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const parsed = parseClaudePayload(text);

    return {
      mode: "live-claude",
      narrative:
        parsed.narrative ||
        "The guide studies the manifest, but the telegraph returns a garbled report.",
      debugNotes:
        parsed.debugNotes?.slice(0, 5) ||
        ["Claude returned a response, but it did not include structured debug notes."]
    };
  } catch (error) {
    console.error("Live trail narration request failed", error);
    warnings.push("Live trail narration request failed. Local narration is enabled.");
    return buildDemoPayload(action, state, warnings);
  }
}

async function loadBioManifest() {
  try {
    const bioPath = path.join(process.cwd(), "bio.md");
    const bio = await readFile(bioPath, "utf8");
    return { bio };
  } catch {
    return { bio: null };
  }
}

function parseClaudePayload(text: string): ClaudeTrailPayload {
  try {
    return JSON.parse(text) as ClaudeTrailPayload;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return { narrative: text, debugNotes: [] };
    }

    try {
      return JSON.parse(match[0]) as ClaudeTrailPayload;
    } catch {
      return { narrative: text, debugNotes: [] };
    }
  }
}

function buildDemoPayload(
  action: TrailAction,
  state: TrailGameState,
  warnings: string[]
): Required<ClaudeTrailPayload> {
  const gameOver =
    state.currentMilestone === "dysentery"
      ? " Alas, tech debt has reached 100. The hiring party has died of dysentery."
      : "";

  return {
    mode: "demo",
    narrative: `The guide marks "${action.label}" in the ledger and studies the trail ahead. The real career manifest is not yet hitched to the wagon, so this demo beat keeps the game moving without inventing candidate facts.${gameOver}`,
    debugNotes: [
      "Fallback narration avoids inventing candidate facts when live trail context is unavailable.",
      `Applied resource delta: ${JSON.stringify(action.resourceDelta)}.`,
      `Current milestone: ${state.currentMilestone}.`,
      ...warnings.slice(0, 2)
    ]
  };
}

function checkRequestSize(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return null;
  }

  const requestBytes = Number(contentLength);

  if (Number.isFinite(requestBytes) && requestBytes > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      {
        error: "The wagon manifest is too large for this trail crossing.",
        code: "WAGON_MANIFEST_TOO_LARGE"
      },
      { status: 413 }
    );
  }

  return null;
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || realIp || "local-trail";
}

function checkRateLimit(clientKey: string) {
  const now = Date.now();
  const bucket = requestBuckets.get(clientKey);

  if (!bucket || bucket.resetAt <= now) {
    cleanupRateLimitBuckets(now);
    requestBuckets.set(clientKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS
    });

    return { limited: false, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  if (bucket.count > RATE_LIMIT_MAX) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000)
    };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

function cleanupRateLimitBuckets(now: number) {
  for (const [key, bucket] of requestBuckets.entries()) {
    if (bucket.resetAt <= now) {
      requestBuckets.delete(key);
    }
  }
}

function normalizeTrailState(candidate: unknown): TrailGameState {
  if (!candidate || typeof candidate !== "object") {
    return initialTrailState;
  }

  const state = candidate as Partial<TrailGameState>;
  const currentMilestone =
    state.currentMilestone && state.currentMilestone in MILESTONES
      ? state.currentMilestone
      : initialTrailState.currentMilestone;
  const resources =
    state.resources && typeof state.resources === "object"
      ? state.resources
      : initialTrailState.resources;
  const log = Array.isArray(state.log) ? state.log.slice(-25) : [];

  return {
    currentMilestone,
    resources: {
      budget: normalizeResource(resources.budget, initialTrailState.resources.budget),
      morale: normalizeResource(resources.morale, initialTrailState.resources.morale),
      techDebt: normalizeResource(
        resources.techDebt,
        initialTrailState.resources.techDebt
      )
    },
    log
  };
}

function normalizeResource(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value)))
    : fallback;
}

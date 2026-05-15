import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  applyActionToState,
  getActionById,
  getActionsForState,
  initialTrailState,
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

export async function POST(request: Request) {
  const warnings: string[] = [];
  const body = (await request.json().catch(() => null)) as TrailRequest | null;
  const sessionId = body?.sessionId || crypto.randomUUID();
  const state = body?.state || initialTrailState;

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
    warnings.push("bio.md is missing. The wagon is running in demo mode.");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    warnings.push("ANTHROPIC_API_KEY is missing. Claude narration is mocked.");
  }

  const supabase = getServerSupabaseClient();
  if (!supabase) {
    warnings.push("Supabase credentials are missing. Session persistence is disabled.");
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
      warnings.push(`Wagon axle broken: Supabase persistence failed (${error.message}).`);
    }
  }

  return NextResponse.json({
    sessionId,
    state: nextState,
    narrative: payload.narrative,
    actions: getActionsForState(nextState),
    developer: {
      mode: payload.mode,
      model: CLAUDE_MODEL,
      systemPrompt: TRAIL_SYSTEM_PROMPT,
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
    const message = error instanceof Error ? error.message : "Unknown Claude error";
    warnings.push(`Telegraph jammed: Claude request failed (${message}).`);
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
      "Demo mode avoids hallucinating because bio.md is not available or Claude is not configured.",
      `Applied resource delta: ${JSON.stringify(action.resourceDelta)}.`,
      `Current milestone: ${state.currentMilestone}.`,
      ...warnings.slice(0, 2)
    ]
  };
}

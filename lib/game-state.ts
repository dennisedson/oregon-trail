export type MilestoneId =
  | "starting_outpost"
  | "high_plains"
  | "river_crossing"
  | "anthropic_valley"
  | "offer_camp"
  | "dysentery";

export type TrailActionId =
  | "review_background"
  | "review_portfolio"
  | "inspect_devex"
  | "set_pace"
  | "discuss_leadership"
  | "manager_test"
  | "deescalate_risk"
  | "refactor_wagon"
  | "safety_alignment"
  | "pbc_alignment"
  | "final_pitch";

export type TrailResources = {
  budget: number;
  morale: number;
  techDebt: number;
};

export type TrailLogEntry = {
  id: string;
  label: string;
  detail: string;
  milestone: MilestoneId;
  resourceDelta: Partial<TrailResources>;
};

export type TrailGameState = {
  currentMilestone: MilestoneId;
  resources: TrailResources;
  log: TrailLogEntry[];
};

export type TrailAction = {
  id: TrailActionId;
  label: string;
  detail: string;
  milestone: MilestoneId;
  nextMilestone?: MilestoneId;
  resourceDelta: Partial<TrailResources>;
};

export const MILESTONES: Record<
  MilestoneId,
  { title: string; location: string; progress: number }
> = {
  starting_outpost: {
    title: "The Starting Outpost",
    location: "Background and Education",
    progress: 10
  },
  high_plains: {
    title: "The High Plains",
    location: "Technical Leadership",
    progress: 38
  },
  river_crossing: {
    title: "The River Crossing",
    location: "Manager Test",
    progress: 64
  },
  anthropic_valley: {
    title: "The Anthropic Valley",
    location: "Mission Alignment",
    progress: 88
  },
  offer_camp: {
    title: "Offer Camp",
    location: "Final Decision",
    progress: 100
  },
  dysentery: {
    title: "Dysentery",
    location: "Technical Debt Reaches 100",
    progress: 0
  }
};

export const TRAIL_ACTIONS: TrailAction[] = [
  {
    id: "review_background",
    label: "Review Background",
    detail: "Audit the candidate's origin story, education, and early practice.",
    milestone: "starting_outpost",
    resourceDelta: { morale: 5, techDebt: -3 }
  },
  {
    id: "review_portfolio",
    label: "Review Portfolio",
    detail: "Inspect shipped developer education work and artifacts.",
    milestone: "starting_outpost",
    nextMilestone: "high_plains",
    resourceDelta: { budget: -4, morale: 8, techDebt: -6 }
  },
  {
    id: "inspect_devex",
    label: "Inspect DX Philosophy",
    detail: "Ask how the guide turns complex APIs into teachable systems.",
    milestone: "starting_outpost",
    resourceDelta: { morale: 6, techDebt: -8 }
  },
  {
    id: "set_pace",
    label: "Set A Faster Pace",
    detail: "Move briskly into the leadership portion of the trail.",
    milestone: "starting_outpost",
    nextMilestone: "high_plains",
    resourceDelta: { budget: -6, morale: -2, techDebt: 8 }
  },
  {
    id: "discuss_leadership",
    label: "Discuss Leadership",
    detail: "Probe team leadership, editorial judgment, and cross-functional work.",
    milestone: "high_plains",
    resourceDelta: { morale: 7, techDebt: -4 }
  },
  {
    id: "manager_test",
    label: "Attempt Manager Test",
    detail: "Cross a difficult Dev Ed river with scope, people, and stakes.",
    milestone: "high_plains",
    nextMilestone: "river_crossing",
    resourceDelta: { budget: -8, morale: 4, techDebt: 10 }
  },
  {
    id: "deescalate_risk",
    label: "Deescalate Risk",
    detail: "Choose a measured plan that protects trust and delivery quality.",
    milestone: "river_crossing",
    resourceDelta: { budget: -5, morale: 6, techDebt: -10 }
  },
  {
    id: "refactor_wagon",
    label: "Refactor The Wagon",
    detail: "Pay down technical debt before the trail gets steep.",
    milestone: "river_crossing",
    resourceDelta: { budget: -10, morale: -1, techDebt: -22 }
  },
  {
    id: "safety_alignment",
    label: "Test Safety Alignment",
    detail: "Examine how the candidate teaches capability with responsibility.",
    milestone: "river_crossing",
    nextMilestone: "anthropic_valley",
    resourceDelta: { morale: 10, techDebt: -5 }
  },
  {
    id: "pbc_alignment",
    label: "Discuss PBC Mission",
    detail: "Ask how public benefit commitments shape developer education.",
    milestone: "anthropic_valley",
    resourceDelta: { morale: 8, techDebt: -6 }
  },
  {
    id: "final_pitch",
    label: "Make Final Pitch",
    detail: "Synthesize the trail evidence for the hiring decision.",
    milestone: "anthropic_valley",
    nextMilestone: "offer_camp",
    resourceDelta: { morale: 12, techDebt: -4 }
  }
];

export const initialTrailState: TrailGameState = {
  currentMilestone: "starting_outpost",
  resources: {
    budget: 100,
    morale: 76,
    techDebt: 18
  },
  log: []
};

export function getActionsForState(state: TrailGameState): TrailAction[] {
  if (state.currentMilestone === "dysentery" || state.currentMilestone === "offer_camp") {
    return [];
  }

  const actions = TRAIL_ACTIONS.filter(
    (action) => action.milestone === state.currentMilestone
  );

  return actions.length > 0 ? actions : TRAIL_ACTIONS.slice(0, 3);
}

export function getActionById(actionId: TrailActionId): TrailAction {
  const action = TRAIL_ACTIONS.find((candidate) => candidate.id === actionId);

  if (!action) {
    throw new Error(`Unknown trail action: ${actionId}`);
  }

  return action;
}

export function applyActionToState(
  state: TrailGameState,
  action: TrailAction
): TrailGameState {
  const resources = {
    budget: clampResource(state.resources.budget + (action.resourceDelta.budget ?? 0)),
    morale: clampResource(state.resources.morale + (action.resourceDelta.morale ?? 0)),
    techDebt: clampResource(
      state.resources.techDebt + (action.resourceDelta.techDebt ?? 0)
    )
  };

  const nextMilestone =
    resources.techDebt >= 100 ? "dysentery" : action.nextMilestone ?? state.currentMilestone;

  const logEntry: TrailLogEntry = {
    id: `${Date.now()}-${action.id}`,
    label: action.label,
    detail: action.detail,
    milestone: nextMilestone,
    resourceDelta: action.resourceDelta
  };

  return {
    currentMilestone: nextMilestone,
    resources,
    log: [logEntry, ...state.log].slice(0, 8)
  };
}

function clampResource(value: number) {
  return Math.max(0, Math.min(100, value));
}

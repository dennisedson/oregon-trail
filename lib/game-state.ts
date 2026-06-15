export type MilestoneId =
  | "starting_outpost"
  | "high_plains"
  | "river_crossing"
  | "developer_valley"
  | "offer_camp"
  | "dysentery";

export type TrailActionId =
  | "review_background"
  | "review_portfolio"
  | "inspect_devex"
  | "set_pace"
  | "rest_at_camp"
  | "hunt_for_leadership"
  | "discuss_leadership"
  | "manager_test"
  | "ford_river"
  | "caulk_wagon"
  | "take_ferry"
  | "wait_for_conditions"
  | "rest_before_pass"
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
  cue: string;
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
  developer_valley: {
    title: "The Developer Valley",
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
    label: "Check Wagon Manifest",
    cue: "Review background and education",
    detail: "Audit the candidate's origin story, education, and early practice.",
    milestone: "starting_outpost",
    resourceDelta: { morale: 5, techDebt: -3 }
  },
  {
    id: "review_portfolio",
    label: "Hunt For Portfolio Proof",
    cue: "Review portfolio and shipped artifacts",
    detail: "Inspect shipped developer education work and artifacts.",
    milestone: "starting_outpost",
    nextMilestone: "high_plains",
    resourceDelta: { budget: -4, morale: 8, techDebt: -6 }
  },
  {
    id: "inspect_devex",
    label: "Talk With Trail Guide",
    cue: "Discuss developer education philosophy",
    detail: "Ask how the guide turns complex APIs into teachable systems.",
    milestone: "starting_outpost",
    resourceDelta: { morale: 6, techDebt: -8 }
  },
  {
    id: "set_pace",
    label: "Set A Faster Pace",
    cue: "Move quickly into leadership signal",
    detail: "Move briskly into the leadership portion of the trail.",
    milestone: "starting_outpost",
    nextMilestone: "high_plains",
    resourceDelta: { budget: -6, morale: -2, techDebt: 8 }
  },
  {
    id: "rest_at_camp",
    label: "Sleep At Camp",
    cue: "Probe sustainable leadership style",
    detail: "Pause the party to inspect team health, communication style, and sustainable leadership habits.",
    milestone: "high_plains",
    resourceDelta: { budget: -3, morale: 10, techDebt: -3 }
  },
  {
    id: "hunt_for_leadership",
    label: "Hunt For Leadership Proof",
    cue: "Find concrete technical leadership evidence",
    detail: "Look for concrete evidence of technical leadership, editorial judgment, and cross-functional influence.",
    milestone: "high_plains",
    resourceDelta: { budget: -4, morale: 7, techDebt: -5 }
  },
  {
    id: "discuss_leadership",
    label: "Trade For Spare Parts",
    cue: "Discuss systems thinking and reusable DX assets",
    detail: "Trade time and budget for stronger systems, reusable docs, and lower operational drag.",
    milestone: "high_plains",
    resourceDelta: { budget: -9, morale: 2, techDebt: -14 }
  },
  {
    id: "manager_test",
    label: "Scout The River",
    cue: "Enter the manager test",
    detail: "Approach a difficult Dev Ed management challenge with scope, people, and stakes.",
    milestone: "high_plains",
    nextMilestone: "river_crossing",
    resourceDelta: { budget: -5, morale: 4, techDebt: 4 }
  },
  {
    id: "ford_river",
    label: "Ford The River",
    cue: "Choose the fast, high-risk management path",
    detail: "Choose the fastest path through the manager test: decisive, direct, but risky for stakeholder trust and technical debt.",
    milestone: "river_crossing",
    nextMilestone: "developer_valley",
    resourceDelta: { morale: 3, techDebt: 26 }
  },
  {
    id: "caulk_wagon",
    label: "Caulk The Wagon",
    cue: "Align scope and protect delivery quality",
    detail: "Seal the plan before crossing: align scope, clarify roles, and protect the work from avoidable leaks.",
    milestone: "river_crossing",
    nextMilestone: "developer_valley",
    resourceDelta: { budget: -8, morale: 5, techDebt: 4 }
  },
  {
    id: "take_ferry",
    label: "Take The Ferry ($15)",
    cue: "Spend budget to reduce people and delivery risk",
    detail: "Spend budget for the safest manager-test crossing: sequence decisions, lower risk, and preserve trust.",
    milestone: "river_crossing",
    nextMilestone: "developer_valley",
    resourceDelta: { budget: -15, morale: 8, techDebt: -12 }
  },
  {
    id: "wait_for_conditions",
    label: "Wait For Conditions",
    cue: "Gather context before committing",
    detail: "Delay the crossing to gather context, de-escalate risk, and pay down technical debt before committing.",
    milestone: "river_crossing",
    resourceDelta: { budget: -3, morale: -4, techDebt: -14 }
  },
  {
    id: "rest_before_pass",
    label: "Make Camp For The Night",
    cue: "Reset before mission alignment",
    detail: "Pause before the final mission-alignment leg to restore team morale and sharpen the hiring signal.",
    milestone: "developer_valley",
    resourceDelta: { budget: -3, morale: 9, techDebt: -2 }
  },
  {
    id: "safety_alignment",
    label: "Check Safety Supplies",
    cue: "Test safety and responsibility alignment",
    detail: "Examine how the candidate teaches capability with responsibility.",
    milestone: "developer_valley",
    resourceDelta: { morale: 10, techDebt: -5 }
  },
  {
    id: "pbc_alignment",
    label: "Consult Mission Compass",
    cue: "Discuss mission and responsibility fit",
    detail: "Ask how public benefit commitments shape developer education.",
    milestone: "developer_valley",
    resourceDelta: { morale: 8, techDebt: -6 }
  },
  {
    id: "final_pitch",
    label: "Take The Final Pass",
    cue: "Make the final hiring case",
    detail: "Synthesize the trail evidence for the hiring decision.",
    milestone: "developer_valley",
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

export interface RankedClassPreference {
  classCode: string;
  rank: number;
  enabled: boolean;
  allowAnyCoachFallback: boolean;
}

export interface CoachPreference {
  coachCode: string;
  rank: number;
  enabled: boolean;
}

export type SeatDirectionPreference =
  | "forward_first"
  | "neutral_then_backward"
  | "any_direction";

export type SeatOrientation = "forward" | "backward" | "neutral" | "unverified";

export interface LegSeatPreference {
  direction: "outbound" | "return";
  preference: SeatDirectionPreference;
  allowUnverifiedSeatDirection: boolean;
}

/**
 * Optional owner-provided heuristic (SEAT-001 in docs/ASSUMPTION_REGISTER.md).
 * Disabled by default; never presented as verified seat direction.
 */
export interface TentativeSeatRuleConfig {
  enabled: boolean;
  assumptionId: "SEAT-001";
  boundarySeatNumber: 30;
  disclaimerLabel: "Tentative owner preference — not verified";
}

export interface PreferenceSheet {
  rankedClasses: RankedClassPreference[];
  preferredCoaches: CoachPreference[];
  outboundSeat: LegSeatPreference;
  returnSeat: LegSeatPreference;
  tentativeSeatRule: TentativeSeatRuleConfig;
  tieBreaker: "lowest_fare" | "earliest_departure";
}

import type {
  DataProvenance,
  JourneyProfile,
  SeatOrientation,
} from "../types/index.js";

export interface CandidateTrainOption {
  trainNumber: string;
  trainName: string;
  fromStation: string;
  toStation: string;
  journeyDate: string;
  departureTime: string; // HH:mm
  classCode: string;
  coachCode?: string;
  seatNumber?: number;
  /** Must be "unverified" unless coach layout, formation, and direction are verified. */
  verifiedSeatOrientation: SeatOrientation;
  availableSeats?: number;
  fareBdt?: number;
  provenance: DataProvenance;
}

export interface EvaluatedOption {
  option: CandidateTrainOption;
  eligible: boolean;
  classRank: number | null;
  coachRank: number | null;
  verifiedDirectionScore: number;
  tentativeSeatScore: number;
  usedTentativeSeatRule: boolean;
  reasons: string[];
}

/**
 * Evaluates the owner-provided SEAT-001 heuristic ONLY when explicitly enabled
 * and NEVER as verified seat direction.
 * Outbound (Dhaka -> Mymensingh pattern): 31+ tentative forward, 1-30 tentative backward.
 * Return (Mymensingh/Dewanganj -> Dhaka pattern): 1-30 tentative forward, 31+ tentative backward.
 */
function scoreTentativeSeatRule(
  direction: "outbound" | "return",
  seatNumber: number | undefined,
  boundary: number,
  preference: "forward_first" | "neutral_then_backward" | "any_direction",
): { score: number; label: string | null } {
  if (seatNumber === undefined || preference === "any_direction") {
    return { score: 0, label: null };
  }
  const isTentativeForward =
    direction === "outbound" ? seatNumber > boundary : seatNumber <= boundary;

  if (preference === "forward_first") {
    return {
      score: isTentativeForward ? 2 : 1,
      label: "Tentative owner preference — not verified",
    };
  }
  return {
    score: isTentativeForward ? 1 : 2,
    label: "Tentative owner preference — not verified",
  };
}

function scoreVerifiedOrientation(
  orientation: SeatOrientation,
  preference: "forward_first" | "neutral_then_backward" | "any_direction",
): number {
  if (orientation === "unverified") return 0;
  if (preference === "any_direction") return 1;
  if (preference === "forward_first") {
    if (orientation === "forward") return 3;
    if (orientation === "neutral") return 2;
    return 1;
  }
  // neutral_then_backward
  if (orientation === "neutral") return 3;
  if (orientation === "backward") return 2;
  return 1;
}

/**
 * Evaluates all verified/candidate options in a single pass according to
 * docs/PREFERENCE_ENGINE.md matching order:
 * 1. Hard constraints (date, route, passenger count, budget, status)
 * 2. Class priority rank
 * 3. Coach priority rank (only when coachCode is exposed)
 * 4. Verified seat direction priority
 * 5. Optional SEAT-001 tentative heuristic (disabled by default)
 * 6. Tie-breaker (lowest fare or earliest departure)
 */
export function rankCandidateOptions(
  profile: JourneyProfile,
  candidates: readonly CandidateTrainOption[],
): EvaluatedOption[] {
  const { preferences } = profile;
  const enabledClasses = new Map(
    preferences.rankedClasses
      .filter((c) => c.enabled)
      .map((c) => [c.classCode.toUpperCase(), c]),
  );
  const enabledCoaches = new Map(
    preferences.preferredCoaches
      .filter((c) => c.enabled)
      .map((c) => [c.coachCode.toUpperCase(), c]),
  );
  const legPref =
    profile.direction === "outbound"
      ? preferences.outboundSeat
      : preferences.returnSeat;

  const evaluated = candidates.map((option): EvaluatedOption => {
    const reasons: string[] = [];
    let eligible = true;

    // 1. Hard constraints
    if (
      option.fromStation.toLowerCase() !== profile.fromStation.toLowerCase() ||
      option.toStation.toLowerCase() !== profile.toStation.toLowerCase() ||
      option.journeyDate !== profile.journeyDate
    ) {
      eligible = false;
      reasons.push("Route or journey date mismatch");
    }

    if (
      option.provenance.status !== "available" &&
      option.provenance.status !== "limited"
    ) {
      eligible = false;
      reasons.push(`Status is ${option.provenance.status} (not confirmed available)`);
    }

    if (
      option.availableSeats !== undefined &&
      option.availableSeats < profile.passengerCount
    ) {
      eligible = false;
      reasons.push(
        `Only ${option.availableSeats} seats shown; need ${profile.passengerCount}`,
      );
    }

    if (
      profile.budgetBdt !== undefined &&
      option.fareBdt !== undefined &&
      option.fareBdt > profile.budgetBdt
    ) {
      eligible = false;
      reasons.push(`Fare ${option.fareBdt} BDT exceeds budget ${profile.budgetBdt} BDT`);
    }

    // 2. Class priority
    const classPref = enabledClasses.get(option.classCode.toUpperCase());
    let classRank: number | null = null;
    if (!classPref) {
      eligible = false;
      reasons.push(`Class ${option.classCode} is not enabled in preference sheet`);
    } else {
      classRank = classPref.rank;
      reasons.push(`Class priority ${classPref.rank} (${option.classCode})`);
    }

    // 3. Coach priority
    let coachRank: number | null = null;
    if (enabledCoaches.size > 0) {
      if (!option.coachCode) {
        reasons.push("Coach preference cannot be applied (coach data unavailable)");
        if (classPref && !classPref.allowAnyCoachFallback) {
          eligible = false;
          reasons.push("Any-coach fallback disabled for this class");
        }
      } else {
        const coachPref = enabledCoaches.get(option.coachCode.toUpperCase());
        if (coachPref) {
          coachRank = coachPref.rank;
          reasons.push(`Coach priority ${coachPref.rank} (${option.coachCode})`);
        } else if (classPref && !classPref.allowAnyCoachFallback) {
          eligible = false;
          reasons.push(`Coach ${option.coachCode} not preferred and fallback disabled`);
        } else {
          reasons.push(`Coach fallback applied (${option.coachCode})`);
        }
      }
    }

    // 4. Verified seat direction
    const verifiedDirectionScore = scoreVerifiedOrientation(
      option.verifiedSeatOrientation,
      legPref.preference,
    );
    let tentativeSeatScore = 0;
    let usedTentativeSeatRule = false;

    if (option.verifiedSeatOrientation !== "unverified") {
      reasons.push(`Verified seat direction: ${option.verifiedSeatOrientation}`);
    } else {
      reasons.push("Seat direction unavailable / unverified");
      if (!legPref.allowUnverifiedSeatDirection) {
        eligible = false;
        reasons.push("Unverified seat direction disallowed by profile");
      } else if (preferences.tentativeSeatRule.enabled) {
        // 5. Optional SEAT-001 tentative sort (never overrides verified mapping)
        const tentative = scoreTentativeSeatRule(
          profile.direction,
          option.seatNumber,
          preferences.tentativeSeatRule.boundarySeatNumber,
          legPref.preference,
        );
        if (tentative.label) {
          tentativeSeatScore = tentative.score;
          usedTentativeSeatRule = true;
          reasons.push(tentative.label);
        }
      }
    }

    return {
      option,
      eligible,
      classRank,
      coachRank,
      verifiedDirectionScore,
      tentativeSeatScore,
      usedTentativeSeatRule,
      reasons,
    };
  });

  return evaluated.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;

    const aClass = a.classRank ?? Number.MAX_SAFE_INTEGER;
    const bClass = b.classRank ?? Number.MAX_SAFE_INTEGER;
    if (aClass !== bClass) return aClass - bClass;

    const aCoach = a.coachRank ?? Number.MAX_SAFE_INTEGER;
    const bCoach = b.coachRank ?? Number.MAX_SAFE_INTEGER;
    if (aCoach !== bCoach) return aCoach - bCoach;

    if (a.verifiedDirectionScore !== b.verifiedDirectionScore) {
      return b.verifiedDirectionScore - a.verifiedDirectionScore;
    }

    if (a.tentativeSeatScore !== b.tentativeSeatScore) {
      return b.tentativeSeatScore - a.tentativeSeatScore;
    }

    // 6. Tie-breakers
    if (preferences.tieBreaker === "lowest_fare") {
      const aFare = a.option.fareBdt ?? Number.MAX_SAFE_INTEGER;
      const bFare = b.option.fareBdt ?? Number.MAX_SAFE_INTEGER;
      if (aFare !== bFare) return aFare - bFare;
    }
    return a.option.departureTime.localeCompare(b.option.departureTime);
  });
}

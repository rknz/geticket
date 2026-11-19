import type { CorridorEdge, StationGraph } from "../station-graph/index.js";
import {
  validateSingleSegment,
  type SegmentValidationStatus,
} from "../segment-validation/index.js";

export interface RouteSuggestion {
  kind: SegmentValidationStatus;
  legs: readonly CorridorEdge[];
  requiresSeparateTickets: boolean;
  summary: string;
}

/**
 * Searches for verified direct segments and explicit two-leg separate-ticket
 * alternatives in a validated StationGraph. Never fabricates unverified stops.
 */
export function findValidatedAlternativeRoutes(
  graph: StationGraph,
  fromCode: string,
  toCode: string,
): RouteSuggestion[] {
  const fromNorm = fromCode.trim().toLowerCase();
  const toNorm = toCode.trim().toLowerCase();
  if (!fromNorm || !toNorm || fromNorm === toNorm) return [];

  const suggestions: RouteSuggestion[] = [];

  // 1. Direct verified segments
  for (const edge of graph.edges) {
    if (
      edge.fromCode.toLowerCase() === fromNorm &&
      edge.toCode.toLowerCase() === toNorm
    ) {
      const check = validateSingleSegment(edge, fromCode, toCode);
      suggestions.push({
        kind: check.status,
        legs: [edge],
        requiresSeparateTickets: false,
        summary: check.explanation,
      });
    }
  }

  // 2. Two-leg multi-leg alternatives (explicitly marked separate tickets)
  const firstLegs = graph.edges.filter(
    (e) =>
      e.fromCode.toLowerCase() === fromNorm &&
      e.toCode.toLowerCase() !== toNorm &&
      e.stopVerified &&
      e.ticketValidityVerified,
  );

  for (const leg1 of firstLegs) {
    const secondLegs = graph.edges.filter(
      (e) =>
        e.fromCode.toLowerCase() === leg1.toCode.toLowerCase() &&
        e.toCode.toLowerCase() === toNorm &&
        e.stopVerified &&
        e.ticketValidityVerified,
    );
    for (const leg2 of secondLegs) {
      suggestions.push({
        kind: "multi_leg_separate_tickets",
        legs: [leg1, leg2],
        requiresSeparateTickets: true,
        summary: `Multi-leg journey via ${leg1.toCode} (Train ${leg1.trainNumber} + Train ${leg2.trainNumber}). Requires separate tickets and onward connection check.`,
      });
    }
  }

  return suggestions;
}

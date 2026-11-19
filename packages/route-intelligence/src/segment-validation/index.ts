import type { CorridorEdge } from "../station-graph/index.js";

export type SegmentValidationStatus =
  | "verified"
  | "multi_leg_separate_tickets"
  | "unverified"
  | "not_recommended";

export interface SegmentValidationResult {
  status: SegmentValidationStatus;
  validForSingleTicket: boolean;
  explanation: string;
}

/**
 * Enforces docs/PROJECT_MASTER.md Section 4:
 * A ticket for one destination (e.g. Dhaka -> Jamalpur) does NOT authorize travel
 * to an unverified or different destination without verified stop + ticket validity.
 */
export function validateSingleSegment(
  edge: CorridorEdge | undefined,
  requestedFrom: string,
  requestedTo: string,
): SegmentValidationResult {
  if (!edge) {
    return {
      status: "unverified",
      validForSingleTicket: false,
      explanation: `No verified direct train segment recorded for ${requestedFrom} -> ${requestedTo}.`,
    };
  }

  const exactMatch =
    edge.fromCode.toLowerCase() === requestedFrom.toLowerCase() &&
    edge.toCode.toLowerCase() === requestedTo.toLowerCase();

  if (!exactMatch) {
    return {
      status: "not_recommended",
      validForSingleTicket: false,
      explanation: `Segment ${edge.fromCode} -> ${edge.toCode} does not match requested ${requestedFrom} -> ${requestedTo}. Do not assume ticket validity across different stations.`,
    };
  }

  if (!edge.stopVerified || !edge.ticketValidityVerified) {
    return {
      status: "unverified",
      validForSingleTicket: false,
      explanation: `Train ${edge.trainNumber} stop or ticket validity is not verified for ${requestedFrom} -> ${requestedTo}.`,
    };
  }

  return {
    status: "verified",
    validForSingleTicket: true,
    explanation: `Verified stop and ticket segment on train ${edge.trainNumber} (${edge.sourceId}, ${edge.verifiedDate}).`,
  };
}

export interface StationNode {
  code: string;
  nameEn: string;
  nameBn?: string;
}

export interface CorridorEdge {
  fromCode: string;
  toCode: string;
  trainNumber: string;
  /** True only when an official timetable confirms the train stops at both stations. */
  stopVerified: boolean;
  /** True only when official ticketing rules allow boarding/alighting on this segment. */
  ticketValidityVerified: boolean;
  sourceId: string;
  verifiedDate: string;
}

export interface StationGraph {
  stations: readonly StationNode[];
  edges: readonly CorridorEdge[];
}

export function findStationByNameOrCode(
  graph: StationGraph,
  query: string,
): StationNode | undefined {
  const normalized = query.trim().toLowerCase();
  return graph.stations.find(
    (s) =>
      s.code.toLowerCase() === normalized ||
      s.nameEn.toLowerCase() === normalized ||
      (s.nameBn !== undefined && s.nameBn.trim() === query.trim()),
  );
}

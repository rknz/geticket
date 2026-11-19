export interface StaticTimetableNote {
  sourceId: string;
  publishedDate: string;
  trainNumber: string;
  trainName: string;
  offDay?: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  isLive: false;
}

export function formatStaticReferenceBadge(note: Pick<StaticTimetableNote, "sourceId" | "publishedDate">): string {
  return `Static reference (${note.sourceId}, dated ${note.publishedDate}) — not live`;
}

import React from "react";

export type SemanticBadgeTone =
  | "live"
  | "stale"
  | "unavailable"
  | "paused"
  | "ready";

const TONE_ICON: Record<SemanticBadgeTone, string> = {
  live: "●",
  stale: "◷",
  unavailable: "○",
  paused: "⏸",
  ready: "→",
};

export interface StatusBadgeProps {
  tone: SemanticBadgeTone;
  label: string;
}

export function StatusBadge({ tone, label }: StatusBadgeProps) {
  return (
    <span className={`gt-badge gt-badge-${tone}`} role="status">
      <span aria-hidden="true">{TONE_ICON[tone]}</span>
      <span>{label}</span>
    </span>
  );
}

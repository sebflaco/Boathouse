/**
 * Domain constants shared across the app — mirrors the prototype.
 * Sport dot colors, boat seat layouts, availability slots.
 */

export type Sport =
  | "rowing"
  | "erging"
  | "strength"
  | "core"
  | "cycling"
  | "indoor_bike"
  | "alternative"
  | "other";

export const SPORTS: Record<Sport, { label: string; color: string }> = {
  rowing: { label: "Rowing", color: "#8A1B21" },
  erging: { label: "Erg", color: "#A8863C" },
  strength: { label: "Strength", color: "#5A4634" },
  core: { label: "Core", color: "#6E5E8C" },
  cycling: { label: "Cycling", color: "#3E6E8C" },
  indoor_bike: { label: "Indoor bike", color: "#5F7F93" },
  alternative: { label: "Alternative", color: "#7A7A52" },
  other: { label: "Other", color: "#6E756C" },
};

export type BoatClass = "1x" | "2x" | "2-" | "4x" | "4-" | "4+" | "8+";

export const BOAT_CLASSES: Record<BoatClass, string[]> = {
  "1x": ["Single"],
  "2x": ["Bow", "Stroke"],
  "2-": ["Bow", "Stroke"],
  "4x": ["Bow", "2", "3", "Stroke"],
  "4-": ["Bow", "2", "3", "Stroke"],
  "4+": ["Bow", "2", "3", "Stroke", "Cox"],
  "8+": ["Bow", "2", "3", "4", "5", "6", "7", "Stroke", "Cox"],
};

export type Slot = "M" | "A" | "E";

export const SLOTS: [Slot, string][] = [
  ["M", "Morning"],
  ["A", "Afternoon"],
  ["E", "Evening"],
];

export type Role = "athlete" | "coach";
export type EventType = "race" | "social" | "other";
export type AvailStatus = "available" | "busy";

/** load = duration × RPE (training-load arbitrary units) */
export const load = (durationMin: number, rpe: number): number =>
  (Number(durationMin) || 0) * (Number(rpe) || 0);

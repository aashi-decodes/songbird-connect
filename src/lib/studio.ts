import type { Mood } from "./mood";

export const INSTRUMENTS = ["Kick", "Snare", "Hi-hat", "Clap", "Bass"] as const;
export const STYLES = ["Pop", "Electronic", "Lo-fi", "R&B", "Ambient", "Retro"] as const;
export type Instrument = (typeof INSTRUMENTS)[number];
export type StudioStyle = (typeof STYLES)[number];
export type BeatPattern = Record<Instrument, boolean[]>;

export type SavedBeat = {
  id: string;
  name: string;
  mood: Mood;
  style: StudioStyle;
  bpm: number;
  pattern: BeatPattern;
  createdAt: number;
};

export const CREATIONS_KEY = "wavely:creations";

const sequence = (steps: number[]) => Array.from({ length: 16 }, (_, index) => steps.includes(index));

const recipes: Record<Mood, Partial<Record<Instrument, number[]>>> = {
  Happy: { Kick: [0, 4, 8, 12], Snare: [4, 12], "Hi-hat": [0, 2, 4, 6, 8, 10, 12, 14], Clap: [4, 12], Bass: [0, 3, 8, 10] },
  Sad: { Kick: [0, 8], Snare: [4, 12], "Hi-hat": [2, 6, 10, 14], Clap: [12], Bass: [0, 7, 10] },
  Energetic: { Kick: [0, 3, 4, 7, 8, 11, 12, 14], Snare: [4, 12], "Hi-hat": [0, 2, 4, 6, 8, 10, 12, 14, 15], Clap: [4, 12], Bass: [0, 2, 6, 8, 11, 14] },
  Chill: { Kick: [0, 7, 10], Snare: [4, 12], "Hi-hat": [2, 6, 10, 14], Clap: [12], Bass: [0, 5, 8, 13] },
  Romantic: { Kick: [0, 6, 10], Snare: [4, 12], "Hi-hat": [0, 4, 8, 12], Clap: [4, 12], Bass: [0, 3, 7, 11, 14] },
  Focus: { Kick: [0, 8], Snare: [4, 12], "Hi-hat": [0, 2, 4, 6, 8, 10, 12, 14], Clap: [], Bass: [0, 6, 8, 14] },
  Nostalgic: { Kick: [0, 4, 8, 11], Snare: [4, 12], "Hi-hat": [2, 6, 10, 14], Clap: [4, 12], Bass: [0, 3, 8, 12] },
};

export function makePattern(mood: Mood, style: StudioStyle, variation = false): BeatPattern {
  const recipe = recipes[mood];
  const pattern = Object.fromEntries(
    INSTRUMENTS.map((instrument) => [instrument, sequence(recipe[instrument] ?? [])]),
  ) as BeatPattern;
  const extraChance = style === "Electronic" ? 0.18 : style === "Ambient" ? 0.04 : 0.1;
  if (variation) {
    INSTRUMENTS.forEach((instrument) => {
      pattern[instrument] = pattern[instrument].map((active, index) =>
        index === 0 || Math.random() > extraChance ? active : !active,
      );
    });
  }
  return pattern;
}

export function readCreations(): SavedBeat[] {
  try {
    const stored = localStorage.getItem(CREATIONS_KEY);
    return stored ? (JSON.parse(stored) as SavedBeat[]) : [];
  } catch {
    return [];
  }
}

export function writeCreations(creations: SavedBeat[]) {
  localStorage.setItem(CREATIONS_KEY, JSON.stringify(creations));
  window.dispatchEvent(new Event("wavely-creations-change"));
}
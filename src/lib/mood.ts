export const MOODS = ["Happy", "Sad", "Energetic", "Chill", "Romantic", "Focus", "Nostalgic"] as const;

export type Mood = (typeof MOODS)[number];

const clues: Array<{ mood: Mood; terms: string[]; catalog: string; style: string }> = [
  { mood: "Focus", terms: ["study", "studying", "focus", "work", "reading", "concentrate"], catalog: "focus instrumental study", style: "Lo-fi" },
  { mood: "Energetic", terms: ["energetic", "energy", "workout", "gym", "running", "travel", "travelling", "road trip", "party"], catalog: "energetic dance workout", style: "Electronic" },
  { mood: "Sad", terms: ["sad", "down", "heartbroken", "cry", "lonely", "blue"], catalog: "sad acoustic songs", style: "Ambient" },
  { mood: "Happy", terms: ["happy", "joy", "good mood", "celebrate", "sunny", "uplifting"], catalog: "happy upbeat hits", style: "Pop" },
  { mood: "Chill", terms: ["chill", "relax", "calm", "unwind", "sleep", "peaceful"], catalog: "chill relaxing music", style: "Lo-fi" },
  { mood: "Romantic", terms: ["romantic", "romance", "love", "date", "valentine"], catalog: "romantic love songs", style: "R&B" },
  { mood: "Nostalgic", terms: ["nostalgic", "nostalgia", "memories", "throwback", "old times", "childhood"], catalog: "nostalgic throwback hits", style: "Retro" },
];

export type MoodIntent = { mood: Mood; catalogTerm: string; style: string };

export function interpretMood(input: string): MoodIntent | null {
  const normalized = input.toLowerCase().replace(/[’']/g, "").trim();
  const match = clues.find((entry) => entry.terms.some((term) => normalized.includes(term)));
  return match ? { mood: match.mood, catalogTerm: match.catalog, style: match.style } : null;
}

export function moodIntent(mood: Mood): MoodIntent {
  const match = clues.find((entry) => entry.mood === mood);
  return match
    ? { mood: match.mood, catalogTerm: match.catalog, style: match.style }
    : { mood, catalogTerm: mood, style: "Pop" };
}
import { searchTracks, type Track } from "./music";

export type ArtistNode = {
  artistId: number;
  artistName: string;
  /** A real track by this artist, used to recenter the universe when selected. */
  representativeTrack: Track;
};

export type UniverseData = {
  center: Track;
  /** Related tracks pulled from the real catalog — never fabricated. */
  tracks: Track[];
  /** Distinct related artists, each backed by a real track. */
  artists: ArtistNode[];
};

const MAX_TRACKS = 10;
const MAX_ARTISTS = 6;

function dedupeTracks(tracks: Track[], excludeId: number): Track[] {
  const seen = new Set<number>([excludeId]);
  const result: Track[] = [];
  for (const track of tracks) {
    if (!track.previewUrl || seen.has(track.trackId)) continue;
    seen.add(track.trackId);
    result.push(track);
  }
  return result;
}

/**
 * Builds a real-catalog "universe" around a track: related songs (by the same
 * artist and the same genre) become orbiting planets, and the distinct artists
 * among them become star nodes. All data comes from the existing iTunes search
 * helpers in `music.ts` — nothing here is invented.
 */
export async function buildUniverse(center: Track): Promise<UniverseData> {
  const searches: Promise<Track[]>[] = [searchTracks(center.artistName, 12)];
  if (center.primaryGenreName) {
    searches.push(searchTracks(center.primaryGenreName, 12));
  }

  const results = await Promise.all(searches);
  const merged = dedupeTracks(results.flat(), center.trackId);

  // Prefer a mix: keep same-artist tracks first (closest relation), then genre matches.
  const tracks = merged.slice(0, MAX_TRACKS);

  const artistMap = new Map<number, ArtistNode>();
  for (const track of tracks) {
    if (track.artistId === center.artistId) continue;
    if (artistMap.has(track.artistId)) continue;
    artistMap.set(track.artistId, {
      artistId: track.artistId,
      artistName: track.artistName,
      representativeTrack: track,
    });
  }

  return {
    center,
    tracks,
    artists: Array.from(artistMap.values()).slice(0, MAX_ARTISTS),
  };
}

/** A safe starting track when no track is currently playing. */
export async function getFallbackCenter(): Promise<Track | null> {
  const results = await searchTracks("top hits 2026", 10);
  return results[0] ?? null;
}

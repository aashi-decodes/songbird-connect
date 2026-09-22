import { searchTracks, type Track } from "./music";

export type ArtistNode = {
  artistId: number;
  artistName: string;
  representativeTrack: Track;
};

export type UniverseData = {
  center: Track;
  tracks: Track[];
  artists: ArtistNode[];
};

const MAX_TRACKS = 10;
const MAX_ARTISTS = 6;

const MAX_PER_ARTIST = 3;

function dedupeTracks(tracks: Track[], excludeId: number): Track[] {
  const seen = new Set<number>([excludeId]);
  const perArtist = new Map<number, number>();
  const result: Track[] = [];

  for (const track of tracks) {
    if (!track.previewUrl || seen.has(track.trackId)) continue;
    const count = perArtist.get(track.artistId) ?? 0;
    if (count >= MAX_PER_ARTIST) continue;
    perArtist.set(track.artistId, count + 1);
    seen.add(track.trackId);
    result.push(track);
  }

  return result;
}

// Interleave result sets so one search can't dominate the universe.
function interleave(sets: Track[][]): Track[] {
  const out: Track[] = [];
  const longest = Math.max(0, ...sets.map((s) => s.length));
  for (let i = 0; i < longest; i++) {
    for (const set of sets) {
      const item = set[i];
      if (item) out.push(item);
    }
  }
  return out;
}

export async function buildUniverse(center: Track): Promise<UniverseData> {
  const searches: Promise<Track[]>[] = [
    searchTracks(center.artistName, 12),
  ];

  if (center.primaryGenreName) {
    searches.push(searchTracks(center.primaryGenreName, 12));
  }

  const results = await Promise.allSettled(searches);

  const successfulResults = results
    .filter(
      (result): result is PromiseFulfilledResult<Track[]> =>
        result.status === "fulfilled",
    )
    .flatMap((result) => result.value);

  const tracks = dedupeTracks(successfulResults, center.trackId).slice(
    0,
    MAX_TRACKS,
  );

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

export async function getFallbackCenter(): Promise<Track | null> {
  const searches = [
    "top hits 2026",
    "popular music",
    "pop hits",
    "bollywood hits",
  ];

  for (const query of searches) {
    try {
      const results = await searchTracks(query, 10);

      if (results.length > 0) {
        return results[0] ?? null;
      }
    } catch {
      // Try the next search instead of getting stuck.
    }
  }

  return null;
}
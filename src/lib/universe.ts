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

export async function buildUniverse(center: Track): Promise<UniverseData> {
  const terms = [center.artistName, center.primaryGenreName].filter(
    (term): term is string => Boolean(term?.trim()),
  );

  const settled = await Promise.allSettled(
    terms.map((term) => searchTracks(term, 15)),
  );

  const merged = dedupeTracks(
    settled.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
    center.trackId,
  );

  const tracks = merged.slice(0, MAX_TRACKS);
  const artistMap = new Map<number, ArtistNode>();

  for (const track of tracks) {
    if (track.artistId === center.artistId || artistMap.has(track.artistId)) continue;
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
  const fallbackTerms = [
    "top hits 2026",
    "pop hits",
    "bollywood hits",
    "popular music",
  ];

  for (const term of fallbackTerms) {
    try {
      const results = await searchTracks(term, 20);
      if (results.length > 0) return results[0];
    } catch {
      // Try the next fallback query.
    }
  }

  return null;
}

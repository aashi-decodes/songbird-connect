export type Track = {
  trackId: number;
  trackName: string;
  artistName: string;
  artistId: number;
  collectionId: number;
  collectionName: string;
  artworkUrl100: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  primaryGenreName?: string;
  releaseDate?: string;
};

export type Album = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artistId: number;
  artworkUrl100: string;
  trackCount?: number;
  releaseDate?: string;
  primaryGenreName?: string;
};

const BASE = "https://itunes.apple.com";

async function jsonp<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Music catalog request failed");
  const text = await res.text();
  return JSON.parse(text) as T;
}

export function art(url: string | undefined, size = 400) {
  if (!url) return "";
  return url.replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`);
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function searchTracks(term: string, limit = 30): Promise<Track[]> {
  if (!term.trim()) return [];
  const data = await jsonp<{ results: Track[] }>(
    `${BASE}/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}`,
  );
  return data.results.filter((t) => t.previewUrl);
}

export async function searchAlbums(term: string, limit = 20): Promise<Album[]> {
  if (!term.trim()) return [];
  const data = await jsonp<{ results: Album[] }>(
    `${BASE}/search?term=${encodeURIComponent(term)}&media=music&entity=album&limit=${limit}`,
  );
  return data.results;
}

export async function getAlbum(
  collectionId: number,
): Promise<{ album: Album | null; tracks: Track[] }> {
  const data = await jsonp<{ results: Array<Album & Track & { wrapperType: string }> }>(
    `${BASE}/lookup?id=${collectionId}&entity=song&limit=200`,
  );
  const album = (data.results.find((r) => r.wrapperType === "collection") as Album) ?? null;
  const tracks = data.results.filter(
    (r) => r.wrapperType === "track" && r.previewUrl,
  ) as unknown as Track[];
  return { album, tracks };
}

export async function getTracksByIds(ids: number[]): Promise<Track[]> {
  if (ids.length === 0) return [];
  const data = await jsonp<{ results: Track[] }>(
    `${BASE}/lookup?id=${ids.join(",")}&entity=song`,
  );
  const map = new Map(data.results.filter((t) => t.previewUrl).map((t) => [t.trackId, t]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Track[];
}

export const GENRES = [
  { label: "Pop Hits", term: "pop hits" },
  { label: "Hip-Hop", term: "hip hop" },
  { label: "Bollywood", term: "bollywood" },
  { label: "Rock Classics", term: "rock classics" },
  { label: "Chill Lo-Fi", term: "lofi chill" },
  { label: "Jazz", term: "jazz" },
  { label: "EDM", term: "electronic dance" },
  { label: "Indie", term: "indie" },
];

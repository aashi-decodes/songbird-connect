import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play, Shuffle } from "lucide-react";
import { art, getAlbum } from "@/lib/music";
import { TrackList } from "@/components/TrackList";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/album/$albumId")({
  head: () => ({
    meta: [
      { title: "Album — Wavely" },
      { name: "description", content: "Play every track from this album on Wavely." },
      { property: "og:title", content: "Album — Wavely" },
      { property: "og:description", content: "Play every track from this album on Wavely." },
    ],
  }),
  component: AlbumPage,
});

function AlbumPage() {
  const { albumId } = Route.useParams();
  const p = usePlayer();
  const { data, isLoading } = useQuery({
    queryKey: ["album", albumId],
    queryFn: () => getAlbum(Number(albumId)),
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return <div className="m-6 h-96 animate-pulse rounded-xl bg-surface" />;
  }

  const album = data?.album;
  const tracks = data?.tracks ?? [];

  if (!album) {
    return <p className="p-8 text-sm text-muted-foreground">This album could not be loaded.</p>;
  }

  return (
    <div className="min-h-full">
      <header className="surface-gradient flex flex-col items-start gap-6 px-4 pb-8 pt-8 sm:flex-row sm:items-end md:px-8">
        <img
          src={art(album.artworkUrl100, 600)}
          alt={`${album.collectionName} cover art`}
          className="w-44 rounded-xl shadow-glow md:w-56"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Album
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-5xl">
            {album.collectionName}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {album.artistName} · {tracks.length} songs
            {album.releaseDate ? ` · ${new Date(album.releaseDate).getFullYear()}` : ""}
          </p>
        </div>
      </header>

      <div className="px-4 pb-10 md:px-8">
        <div className="flex gap-3">
          <button
            onClick={() => p.playQueue(tracks, 0)}
            disabled={tracks.length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            <Play className="size-4 fill-current" /> Play
          </button>
          <button
            onClick={() => {
              if (!p.shuffle) p.toggleShuffle();
              p.playQueue(tracks, Math.floor(Math.random() * Math.max(tracks.length, 1)));
            }}
            disabled={tracks.length === 0}
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-50"
          >
            <Shuffle className="size-4" /> Shuffle
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-surface/70 p-2">
          <TrackList tracks={tracks} showArt={false} numbered />
        </div>
      </div>
    </div>
  );
}

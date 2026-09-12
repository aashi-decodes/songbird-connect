import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Play } from "lucide-react";
import { getTracksByIds } from "@/lib/music";
import { TrackList } from "@/components/TrackList";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Your Library — Liked Songs on Wavely" },
      {
        name: "description",
        content: "All the songs you saved, ready to play as your personal playlist.",
      },
      { property: "og:title", content: "Your Library — Liked Songs on Wavely" },
      {
        property: "og:description",
        content: "All the songs you saved, ready to play as your personal playlist.",
      },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const p = usePlayer();
  const { data, isLoading } = useQuery({
    queryKey: ["liked", p.liked],
    queryFn: () => getTracksByIds(p.liked),
    enabled: p.liked.length > 0,
  });

  const tracks = data ?? [];

  return (
    <div className="min-h-full px-4 pb-10 pt-6 md:px-8">
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-end">
        <div className="grid size-40 place-items-center rounded-xl bg-primary/20 shadow-glow">
          <Heart className="size-16 fill-primary text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Playlist
          </p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight md:text-5xl">Liked Songs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {p.liked.length} {p.liked.length === 1 ? "song" : "songs"}
          </p>
        </div>
      </header>

      {tracks.length > 0 && (
        <button
          onClick={() => p.playQueue(tracks, 0)}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105"
        >
          <Play className="size-4 fill-current" /> Play
        </button>
      )}

      <div className="mt-6">
        {p.liked.length === 0 ? (
          <div className="rounded-xl bg-surface p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No saved songs yet. Tap the heart on any track to add it here.
            </p>
            <Link
              to="/search"
              className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Find music
            </Link>
          </div>
        ) : isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-surface" />
        ) : (
          <div className="rounded-xl bg-surface/70 p-2">
            <TrackList tracks={tracks} />
          </div>
        )}
      </div>
    </div>
  );
}

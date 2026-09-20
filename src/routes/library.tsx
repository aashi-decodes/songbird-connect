import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Heart, Play, Pencil, Trash2, Disc3 } from "lucide-react";
import { getTracksByIds } from "@/lib/music";
import { TrackList } from "@/components/TrackList";
import { usePlayer } from "@/lib/player";
import { Button } from "@/components/ui/button";
import { readCreations, writeCreations, type SavedBeat } from "@/lib/studio";

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
  const [creations, setCreations] = useState<SavedBeat[]>([]);

  useEffect(() => {
    const refresh = () => setCreations(readCreations());
    refresh();
    window.addEventListener("wavely-creations-change", refresh);
    return () => window.removeEventListener("wavely-creations-change", refresh);
  }, []);

  const rename = (beat: SavedBeat) => {
    const nextName = window.prompt("Rename your beat", beat.name)?.trim();
    if (!nextName) return;
    const next = creations.map((item) => item.id === beat.id ? { ...item, name: nextName } : item);
    writeCreations(next); setCreations(next);
  };

  const remove = (id: string) => {
    const next = creations.filter((item) => item.id !== id);
    writeCreations(next); setCreations(next);
  };

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

      <section className="mt-10 border-t border-border pt-8">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Wavely Studio</p><h2 className="mt-1 text-2xl font-bold">Your Creations</h2></div>
          <Button asChild size="sm"><Link to="/studio" search={{}}>New beat</Link></Button>
        </div>
        {creations.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">Your saved beats will appear here.</p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {creations.map((beat) => (
              <article key={beat.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/15"><Disc3 className="text-primary" /></span><div className="min-w-0"><h3 className="truncate font-semibold">{beat.name}</h3><p className="text-xs text-muted-foreground">{beat.mood} · {beat.style} · {beat.bpm} BPM</p></div></div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <Button asChild size="sm"><Link to="/studio" search={{ edit: beat.id }}> <Play /> Play</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link to="/studio" search={{ edit: beat.id }}>Edit</Link></Button>
                  <Button size="icon" variant="ghost" aria-label={`Rename ${beat.name}`} title="Rename" onClick={() => rename(beat)}><Pencil /></Button>
                  <Button size="icon" variant="ghost" aria-label={`Delete ${beat.name}`} title="Delete" onClick={() => remove(beat.id)}><Trash2 /></Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

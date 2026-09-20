import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play, SlidersHorizontal, Orbit } from "lucide-react";
import { GENRES, searchAlbums, searchTracks, art, type Track } from "@/lib/music";
import { AlbumCard } from "@/components/MediaCard";
import { TrackList } from "@/components/TrackList";
import { usePlayer } from "@/lib/player";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wavely — Listen to Music Free Online" },
      {
        name: "description",
        content:
          "Discover trending songs, browse albums and play music instantly in your browser with Wavely.",
      },
      { property: "og:title", content: "Wavely — Listen to Music Free Online" },
      {
        property: "og:description",
        content: "Discover trending songs, browse albums and play music instantly in your browser.",
      },
    ],
  }),
  component: Home,
});

function Row({ title, term }: { title: string; term: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["albums", term],
    queryFn: () => searchAlbums(term, 10),
    staleTime: 1000 * 60 * 30,
  });

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-bold tracking-tight">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl bg-surface" />
            ))
          : data?.slice(0, 10).map((a) => (
              <AlbumCard
                key={a.collectionId}
                albumId={a.collectionId}
                title={a.collectionName}
                subtitle={a.artistName}
                artwork={a.artworkUrl100}
              />
            ))}
      </div>
    </section>
  );
}

function Home() {
  const p = usePlayer();

  const { data: trending } = useQuery({
    queryKey: ["trending"],
    queryFn: () => searchTracks("top hits 2026", 12),
    staleTime: 1000 * 60 * 30,
  });

  const hero: Track | undefined = trending?.[0];

  return (
    <div className="surface-gradient min-h-full px-4 pb-10 pt-6 md:px-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Welcome to Wavely
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
            Your world. Your rhythm.
          </h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            Discover music by mood, genre and vibe. Search the public Apple Music catalog,
            build a queue, and explore the Song Universe.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => trending && p.playQueue(trending, 0)}
              disabled={!trending?.length}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
            >
              <Play className="size-4 fill-current" /> Play trending
            </button>
            <Link
              to="/search"
              className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
            >
              Search music
            </Link>
          </div>
        </div>
        {hero && (
          <img
            src={art(hero.artworkUrl100, 600)}
            alt={`${hero.collectionName} cover art`}
            className="w-48 rounded-2xl shadow-glow md:w-60"
          />
        )}
      </header>

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-bold tracking-tight">Trending Now</h2>
        <div className="rounded-xl bg-surface/70 p-2">
          {trending ? (
            <TrackList tracks={trending} />
          ) : (
            <div className="h-64 animate-pulse rounded-lg bg-surface" />
          )}
        </div>
      </section>

      <section className="universe-teaser relative mt-10 overflow-hidden rounded-2xl border border-primary/20 px-5 py-8 sm:px-8">
        <div className="universe-teaser-stars" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ top: `${(i * 37) % 90}%`, left: `${(i * 61) % 95}%` }} />
          ))}
        </div>
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">New</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Explore Song Universe 🪐</h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Travel through a living galaxy built from the real catalog — every song a planet,
              every artist a star. Jump from track to track and see where the connections take you.
            </p>
          </div>
          <Link
            to="/universe"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105"
          >
            <Orbit className="size-4" /> Enter the Universe
          </Link>
        </div>
      </section>

      <section className="mt-8 flex flex-col items-start justify-between gap-4 border-y border-border py-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Wavely Studio</p>
          <h2 className="mt-1 text-xl font-bold">Create your own sound</h2>
          <p className="mt-1 text-sm text-muted-foreground">Build a beat from your mood with an easy 16-step studio.</p>
        </div>
        <Link
          to="/studio"
          search={{}}
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
        >
          <SlidersHorizontal className="size-4" /> Open Studio
        </Link>
      </section>

      {GENRES.map((g) => (
        <Row key={g.term} title={g.label} term={g.term} />
      ))}
    </div>
  );
}

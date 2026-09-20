import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { GENRES, searchAlbums, searchTracks } from "@/lib/music";
import { TrackList } from "@/components/TrackList";
import { AlbumCard } from "@/components/MediaCard";
import { MOODS, interpretMood, moodIntent, type Mood } from "@/lib/mood";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search Songs, Artists & Albums — Wavely" },
      {
        name: "description",
        content: "Search millions of songs, artists and albums and play previews instantly.",
      },
      { property: "og:title", content: "Search Songs, Artists & Albums — Wavely" },
      {
        property: "og:description",
        content: "Search millions of songs, artists and albums and play previews instantly.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [input, setInput] = useState("");
  const [term, setTerm] = useState("");
  const [literal, setLiteral] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setTerm(input.trim()), 400);
    return () => clearTimeout(id);
  }, [input]);

  const intent = literal ? null : interpretMood(term);
  const catalogTerm = intent?.catalogTerm ?? term;

  const tracks = useQuery({
    queryKey: ["search-tracks", catalogTerm],
    queryFn: () => searchTracks(catalogTerm, 30),
    enabled: catalogTerm.length > 0,
  });
  const albums = useQuery({
    queryKey: ["search-albums", catalogTerm],
    queryFn: () => searchAlbums(catalogTerm, 10),
    enabled: catalogTerm.length > 0,
  });

  return (
    <div className="min-h-full px-4 pb-10 pt-6 md:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Search</h1>

      <div className="relative mt-4 max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setLiteral(false); }}
          placeholder="What are you feeling today?"
          aria-label="Search music"
          className="w-full rounded-full bg-surface-elevated py-3 pl-11 pr-4 text-sm outline-none ring-primary/60 placeholder:text-muted-foreground focus:ring-2"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <Button key={mood} size="sm" variant={intent?.mood === mood ? "default" : "outline"} onClick={() => { const next = moodIntent(mood); setInput(`I'm feeling ${mood.toLowerCase()}`); setTerm(`I'm feeling ${mood.toLowerCase()}`); setLiteral(false); }}>
            {mood}
          </Button>
        ))}
      </div>

      {term && intent && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-l-2 border-primary pl-4 text-sm">
          <span>Finding <strong>{intent.mood.toLowerCase()}</strong> music for you.</span>
          <button onClick={() => setLiteral(true)} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">Search “{term}” literally</button>
        </div>
      )}

      {!term && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Browse genres</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {GENRES.map((g) => (
              <button
                key={g.term}
                onClick={() => setInput(g.term)}
                className="rounded-xl bg-surface-elevated p-6 text-left text-base font-bold transition-transform hover:scale-[1.02]"
              >
                {g.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {term && (
        <>
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold">Songs</h2>
            {tracks.isLoading ? (
              <div className="h-64 animate-pulse rounded-xl bg-surface" />
            ) : tracks.data && tracks.data.length > 0 ? (
              <div className="rounded-xl bg-surface/70 p-2">
                <TrackList tracks={tracks.data} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No songs found for "{term}".</p>
            )}
          </section>

          {albums.data && albums.data.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-bold">Albums</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {albums.data.map((a) => (
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
          )}
          {intent && (
            <Link to="/studio" search={{ mood: intent.mood, style: intent.style as "Pop" | "Electronic" | "Lo-fi" | "R&B" | "Ambient" | "Retro" }} className="mt-8 inline-flex text-sm font-semibold text-primary hover:underline">
              Can’t find exactly what you’re feeling? Create your own sound →
            </Link>
          )}
        </>
      )}
    </div>
  );
}

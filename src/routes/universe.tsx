import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SongUniverse } from "@/components/SongUniverse";
import { getFallbackCenter } from "@/lib/universe";
import { usePlayer } from "@/lib/player";
import type { Track } from "@/lib/music";

export const Route = createFileRoute("/universe")({
  head: () => ({
    meta: [
      { title: "Song Universe — Explore Music on Wavely" },
      {
        name: "description",
        content:
          "Travel through a real, ever-expanding galaxy of songs and artists from the Wavely catalog.",
      },
      { property: "og:title", content: "Song Universe — Explore Music on Wavely" },
      {
        property: "og:description",
        content:
          "Travel through a real, ever-expanding galaxy of songs and artists from the Wavely catalog.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UniversePage,
});

function UniversePage() {
  const p = usePlayer();
  const [startTrack, setStartTrack] = useState<Track | null>(p.current);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (startTrack) return;

    let cancelled = false;

    const loadTrack = async () => {
      try {
        const timeout = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 5000),
        );

        const track = await Promise.race([
          getFallbackCenter(),
          timeout,
        ]);

        if (!cancelled) {
          if (track) {
            setStartTrack(track);
          } else {
            setFailed(true);
          }
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      }
    };

    void loadTrack();

    return () => {
      cancelled = true;
    };
  }, [startTrack]);

  if (failed && !startTrack) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Song Universe</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Music data could not be loaded right now.
          </p>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setStartTrack(null);
            }}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <SongUniverse initialTrack={startTrack} />
    </div>
  );
}
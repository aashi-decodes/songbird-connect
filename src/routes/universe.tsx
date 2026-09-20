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

  useEffect(() => {
    if (startTrack) return;
    let cancelled = false;
    void getFallbackCenter().then((track) => {
      if (!cancelled) setStartTrack(track);
    });
    return () => {
      cancelled = true;
    };
  }, [startTrack]);

  return (
    <div className="h-full w-full">
      <SongUniverse initialTrack={startTrack} />
    </div>
  );
}

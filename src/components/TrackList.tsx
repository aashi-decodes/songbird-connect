import { Heart, Pause, Play, ListPlus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { usePlayer } from "@/lib/player";
import { art, formatTime, type Track } from "@/lib/music";
import { cn } from "@/lib/utils";

export function TrackList({
  tracks,
  showArt = true,
  numbered = false,
}: {
  tracks: Track[];
  showArt?: boolean;
  numbered?: boolean;
}) {
  const p = usePlayer();

  return (
    <ul className="flex flex-col">
      {tracks.map((track, i) => {
        const active = p.current?.trackId === track.trackId;
        return (
          <li
            key={track.trackId}
            className={cn(
              "group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/60",
              active && "bg-accent/70",
            )}
          >
            <button
              onClick={() => (active ? p.toggle() : p.playQueue(tracks, i))}
              aria-label={active && p.isPlaying ? `Pause ${track.trackName}` : `Play ${track.trackName}`}
              className="flex items-center gap-3"
            >
              {numbered && (
                <span className="w-5 text-right text-sm tabular-nums text-muted-foreground group-hover:hidden">
                  {i + 1}
                </span>
              )}
              <span
                className={cn(
                  "grid size-5 place-items-center text-primary",
                  numbered && "hidden group-hover:grid",
                )}
              >
                {active && p.isPlaying ? (
                  <Pause className="size-4 fill-current" />
                ) : (
                  <Play className="size-4 fill-current" />
                )}
              </span>
              {showArt && (
                <img
                  src={art(track.artworkUrl100, 100)}
                  alt={`${track.collectionName} cover art`}
                  className="size-10 rounded object-cover"
                  loading="lazy"
                />
              )}
            </button>

            <div className="min-w-0">
              <p className={cn("truncate text-sm font-medium", active && "text-primary")}>
                {track.trackName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {track.artistName}
                {track.collectionId ? (
                  <>
                    {" · "}
                    <Link
                      to="/album/$albumId"
                      params={{ albumId: String(track.collectionId) }}
                      className="hover:underline"
                    >
                      {track.collectionName}
                    </Link>
                  </>
                ) : null}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => p.addToQueue(track)}
                aria-label="Add to queue"
                className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                <ListPlus className="size-4" />
              </button>
              <button
                onClick={() => p.toggleLike(track)}
                aria-label="Save to Liked Songs"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Heart
                  className={cn("size-4", p.isLiked(track.trackId) && "fill-primary text-primary")}
                />
              </button>
              <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                {formatTime((track.trackTimeMillis ?? 0) / 1000)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

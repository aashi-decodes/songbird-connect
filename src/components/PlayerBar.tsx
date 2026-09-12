import {
  Heart,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayer } from "@/lib/player";
import { art, formatTime } from "@/lib/music";
import { cn } from "@/lib/utils";

export function PlayerBar() {
  const p = usePlayer();
  const track = p.current;

  return (
    <footer className="border-t border-border bg-surface px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex w-0 min-w-0 flex-1 items-center gap-3 md:w-64 md:flex-none">
          {track ? (
            <>
              <img
                src={art(track.artworkUrl100, 100)}
                alt={`${track.collectionName} cover art`}
                className="size-12 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{track.trackName}</p>
                <p className="truncate text-xs text-muted-foreground">{track.artistName}</p>
              </div>
              <button
                onClick={() => p.toggleLike(track)}
                aria-label="Save to Liked Songs"
                className="ml-1 hidden shrink-0 text-muted-foreground transition-colors hover:text-primary sm:block"
              >
                <Heart
                  className={cn("size-4", p.isLiked(track.trackId) && "fill-primary text-primary")}
                />
              </button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Pick a song to start listening</p>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={p.toggleShuffle}
              aria-label="Shuffle"
              className={cn(
                "hidden text-muted-foreground transition-colors hover:text-foreground sm:block",
                p.shuffle && "text-primary",
              )}
            >
              <Shuffle className="size-4" />
            </button>
            <button
              onClick={p.prev}
              aria-label="Previous track"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <SkipBack className="size-5 fill-current" />
            </button>
            <button
              onClick={p.toggle}
              aria-label={p.isPlaying ? "Pause" : "Play"}
              disabled={!track}
              className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40"
            >
              {p.isPlaying ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 translate-x-px fill-current" />
              )}
            </button>
            <button
              onClick={p.next}
              aria-label="Next track"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <SkipForward className="size-5 fill-current" />
            </button>
            <button
              onClick={p.cycleRepeat}
              aria-label="Repeat"
              className={cn(
                "hidden text-muted-foreground transition-colors hover:text-foreground sm:block",
                p.repeat !== "off" && "text-primary",
              )}
            >
              {p.repeat === "one" ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
            </button>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2">
            <span className="w-9 text-right text-[11px] tabular-nums text-muted-foreground">
              {formatTime(p.progress)}
            </span>
            <input
              type="range"
              min={0}
              max={p.duration || 30}
              step={0.1}
              value={p.progress}
              onChange={(e) => p.seek(Number(e.target.value))}
              aria-label="Seek"
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-accent accent-primary"
            />
            <span className="w-9 text-[11px] tabular-nums text-muted-foreground">
              {formatTime(p.duration)}
            </span>
          </div>
        </div>

        <div className="hidden w-40 items-center justify-end gap-2 md:flex">
          <button
            onClick={p.toggleMute}
            aria-label="Mute"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {p.muted || p.volume === 0 ? (
              <VolumeX className="size-4" />
            ) : p.volume < 0.5 ? (
              <Volume1 className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={p.muted ? 0 : p.volume}
            onChange={(e) => p.setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-accent accent-primary"
          />
        </div>
      </div>
    </footer>
  );
}

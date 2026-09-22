import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  ListPlus,
  Loader2,
  Maximize,
  Minus,
  Pause,
  Play,
  Plus,
} from "lucide-react";
import { art, formatTime, type Track } from "@/lib/music";
import { buildUniverse, type ArtistNode } from "@/lib/universe";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

const CANVAS_SIZE = 1400;
const CENTER = CANVAS_SIZE / 2;
const TRACK_RADIUS: [number, number] = [340, 460];
const ARTIST_RADIUS = 600;

type PlacedTrack = { track: Track; x: number; y: number; ring: number };
type PlacedArtist = { artist: ArtistNode; x: number; y: number };

function place(count: number, radius: number, startAngle = 0) {
  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + (i / Math.max(count, 1)) * Math.PI * 2;
    return { x: CENTER + Math.cos(angle) * radius, y: CENTER + Math.sin(angle) * radius, angle };
  });
}

// Deterministic pseudo-random star field (no re-shuffling on re-render).
const STAR_FIELD = Array.from({ length: 60 }, (_, i) => {
  const seeded = (n: number) => ((Math.sin(n) + 1) / 2) % 1;
  return {
    top: `${seeded(i * 12.9898) * 100}%`,
    left: `${seeded(i * 78.233) * 100}%`,
    duration: `${3 + seeded(i * 4.14) * 3}s`,
    delay: `${-seeded(i * 9.77) * 4}s`,
  };
});

export function SongUniverse({ initialTrack }: { initialTrack: Track | null }) {
  const p = usePlayer();
  const [center, setCenter] = useState<Track | null>(initialTrack);
  const [selected, setSelected] = useState<Track | null>(initialTrack);
  const [history, setHistory] = useState<Track[]>([]);

  // The starting track can arrive after mount (fallback lookup); adopt it then.
  useEffect(() => {
    if (!initialTrack) return;
    setCenter((c) => c ?? initialTrack);
    setSelected((s) => s ?? initialTrack);
  }, [initialTrack]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["universe", center?.trackId],
    queryFn: () => buildUniverse(center as Track),
    enabled: !!center,
    staleTime: 1000 * 60 * 10,
  });

  const positioned = useMemo(() => {
    if (!data) return { tracks: [] as PlacedTrack[], artists: [] as PlacedArtist[] };
    const innerRadius = TRACK_RADIUS[0] ?? 340;
    const outerRadius = TRACK_RADIUS[1] ?? 460;
    const half = Math.ceil(data.tracks.length / 2);
    const innerSpots = place(half, innerRadius, 0);
    const outerSpots = place(data.tracks.length - half, outerRadius, Math.PI / Math.max(half, 1));
    const tracks: PlacedTrack[] = data.tracks.map((track, i) => {
      const inner = i < half;
      const spot = (inner ? innerSpots[i] : outerSpots[i - half]) ?? { x: CENTER, y: CENTER };
      return { track, x: spot.x, y: spot.y, ring: inner ? 0 : 1 };
    });
    const artistSpots = place(data.artists.length, ARTIST_RADIUS, Math.PI / 5);
    const artists: PlacedArtist[] = data.artists.map((artist, i) => {
      const spot = artistSpots[i] ?? { x: CENTER, y: CENTER };
      return { artist, x: spot.x, y: spot.y };
    });
    return { tracks, artists };
  }, [data]);

  const travelTo = useCallback(
    (track: Track) => {
      setHistory((h) => (center ? [...h, center] : h));
      setCenter(track);
      setSelected(track);
    },
    [center],
  );

  const goBack = useCallback(() => {
    setHistory((h) => {
      const previous = h[h.length - 1];
      if (!previous) return h;
      setCenter(previous);
      setSelected(previous);
      return h.slice(0, -1);
    });
  }, []);

  if (!center) {
    return (
      <div className="grid h-full place-items-center px-6 text-center">
        <div>
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading the Song Universe…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="universe-stage relative h-full w-full overflow-hidden">
      <div className="universe-stars" aria-hidden="true">
        {STAR_FIELD.map((star, i) => (
          <span
            key={i}
            style={{
              top: star.top,
              left: star.left,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4 md:p-6">
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            to="/"
            className="grid size-10 place-items-center rounded-full border border-white/10 bg-black/40 text-foreground backdrop-blur-md transition-colors hover:bg-black/60"
            aria-label="Back to Home"
          >
            <ArrowLeft className="size-4" />
          </Link>
          {history.length > 0 && (
            <button
              onClick={goBack}
              className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-black/60"
            >
              ← Previous song
            </button>
          )}
        </div>
        <div className="pointer-events-auto rounded-full border border-white/10 bg-black/40 px-4 py-2 text-right backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Song Universe 🪐
          </p>
          <p className="text-[11px] text-muted-foreground">Explore music. Travel through sound.</p>
        </div>
      </header>

      {error ? (
        <div className="grid h-full place-items-center px-6 text-center">
          <p className="text-sm text-muted-foreground">
            The universe couldn't load related songs right now. Try another song from Search.
          </p>
        </div>
      ) : (
        <TransformWrapper
          initialScale={0.65}
          minScale={0.35}
          maxScale={2.2}
          centerOnInit
          limitToBounds={false}
          wheel={{ step: 0.12 }}
          pinch={{ step: 5 }}
          doubleClick={{ mode: "zoomIn" }}
        >
          <UniverseControls />
          <TransformComponent wrapperClass="!h-full !w-full" contentClass="!h-full !w-full">
            <svg
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
              className="pointer-events-none"
            >
              <circle cx={CENTER} cy={CENTER} r={TRACK_RADIUS[0]} className="universe-orbit" />
              <circle cx={CENTER} cy={CENTER} r={TRACK_RADIUS[1]} className="universe-orbit" />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={ARTIST_RADIUS}
                className="universe-orbit universe-orbit-dashed"
              />
              {positioned.tracks.map((p) => (
                <line
                  key={`line-${p.track.trackId}`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={p.x}
                  y2={p.y}
                  className="universe-link"
                />
              ))}
              {positioned.artists.map((a) => (
                <line
                  key={`line-artist-${a.artist.artistId}`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={a.x}
                  y2={a.y}
                  className="universe-link universe-link-faint"
                />
              ))}
            </svg>

            <div
              className="absolute left-0 top-0"
              style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            >
              <CenterPlanet
                track={center}
                loading={isLoading || isFetching}
                onSelect={() => setSelected(center)}
              />

              {positioned.tracks.map(({ track, x, y }) => (
                <PlanetNode
                  key={track.trackId}
                  track={track}
                  x={x}
                  y={y}
                  active={selected?.trackId === track.trackId}
                  onSelect={() => setSelected(track)}
                  onTravel={() => travelTo(track)}
                />
              ))}

              {positioned.artists.map(({ artist, x, y }) => (
                <StarNode
                  key={artist.artistId}
                  artist={artist}
                  x={x}
                  y={y}
                  onTravel={() => travelTo(artist.representativeTrack)}
                />
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      )}

      {selected && (
        <SelectedPanel
          track={selected}
          onClose={() => setSelected(null)}
          isPlaying={p.current?.trackId === selected.trackId && p.isPlaying}
          onPlayToggle={() => {
            if (p.current?.trackId === selected.trackId) p.toggle();
            else p.playQueue([selected, ...(data?.tracks ?? [])], 0);
          }}
          liked={p.isLiked(selected.trackId)}
          onLike={() => p.toggleLike(selected)}
          onQueue={() => p.addToQueue(selected)}
        />
      )}
    </div>
  );
}

function UniverseControls() {
  const { zoomIn, zoomOut, resetTransform, centerView } = useControls();
  return (
    <div className="pointer-events-auto absolute bottom-6 right-4 z-20 flex flex-col gap-2 md:right-6">
      <button
        onClick={() => zoomIn()}
        aria-label="Zoom in"
        className="grid size-10 place-items-center rounded-full border border-white/10 bg-black/40 text-foreground backdrop-blur-md transition-colors hover:bg-black/60"
      >
        <Plus className="size-4" />
      </button>
      <button
        onClick={() => zoomOut()}
        aria-label="Zoom out"
        className="grid size-10 place-items-center rounded-full border border-white/10 bg-black/40 text-foreground backdrop-blur-md transition-colors hover:bg-black/60"
      >
        <Minus className="size-4" />
      </button>
      <button
        onClick={() => {
          resetTransform();
          centerView();
        }}
        aria-label="Reset view"
        className="grid size-10 place-items-center rounded-full border border-white/10 bg-black/40 text-foreground backdrop-blur-md transition-colors hover:bg-black/60"
      >
        <Maximize className="size-4" />
      </button>
    </div>
  );
}

function CenterPlanet({
  track,
  loading,
  onSelect,
}: {
  track: Track;
  loading: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="universe-planet universe-planet-center"
      style={{ left: CENTER, top: CENTER }}
      aria-label={`${track.trackName} by ${track.artistName} — center of the universe`}
    >
      <span className="universe-planet-glow" aria-hidden="true" />
      <img src={art(track.artworkUrl100, 300)} alt="" className="universe-planet-art" />
      {loading && (
        <span className="universe-planet-spinner" aria-hidden="true">
          <Loader2 className="size-5 animate-spin text-primary" />
        </span>
      )}
      <span className="universe-planet-label universe-planet-label-center">
        <span className="block truncate font-semibold">{track.trackName}</span>
        <span className="block truncate text-muted-foreground">{track.artistName}</span>
      </span>
    </button>
  );
}

function PlanetNode({
  track,
  x,
  y,
  active,
  onSelect,
  onTravel,
}: {
  track: Track;
  x: number;
  y: number;
  active: boolean;
  onSelect: () => void;
  onTravel: () => void;
}) {
  return (
    <button
      onClick={() => {
        onSelect();
        onTravel();
      }}
      className={cn("universe-planet universe-planet-orbit", active && "universe-planet-active")}
      style={{ left: x, top: y }}
      aria-label={`Travel to ${track.trackName} by ${track.artistName}`}
      title={`${track.trackName} — ${track.artistName}`}
    >
      <img src={art(track.artworkUrl100, 200)} alt="" className="universe-planet-art" />
      <span className="universe-planet-label">
        <span className="block truncate font-semibold">{track.trackName}</span>
        <span className="block truncate text-muted-foreground">{track.artistName}</span>
      </span>
    </button>
  );
}

function StarNode({
  artist,
  x,
  y,
  onTravel,
}: {
  artist: ArtistNode;
  x: number;
  y: number;
  onTravel: () => void;
}) {
  return (
    <button
      onClick={onTravel}
      className="universe-star"
      style={{ left: x, top: y }}
      aria-label={`Explore artist ${artist.artistName}`}
      title={artist.artistName}
    >
      <span className="universe-star-dot" aria-hidden="true" />
      <span className="universe-star-label">{artist.artistName}</span>
    </button>
  );
}

function SelectedPanel({
  track,
  onClose,
  isPlaying,
  onPlayToggle,
  liked,
  onLike,
  onQueue,
}: {
  track: Track;
  onClose: () => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  liked: boolean;
  onLike: () => void;
  onQueue: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex justify-center p-3 md:bottom-6 md:p-0">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-black/60 p-3 shadow-glow backdrop-blur-xl md:gap-4 md:p-4">
        <img
          src={art(track.artworkUrl100, 200)}
          alt={`${track.collectionName} cover art`}
          className="size-16 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{track.trackName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {track.artistName}
            {track.primaryGenreName ? ` · ${track.primaryGenreName}` : ""}
          </p>
          {track.trackTimeMillis ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {formatTime(track.trackTimeMillis / 1000)}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={onPlayToggle}
            aria-label={isPlaying ? "Pause" : "Play preview"}
            className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="size-4 translate-x-px fill-current" />
            )}
          </button>
          <button
            onClick={onLike}
            aria-label="Save to Liked Songs"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-primary"
          >
            <Heart className={cn("size-4", liked && "fill-primary text-primary")} />
          </button>
          <button
            onClick={onQueue}
            aria-label="Add to queue"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <ListPlus className="size-4" />
          </button>
        </div>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="ml-1 shrink-0 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

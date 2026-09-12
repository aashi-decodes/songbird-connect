import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Track } from "./music";

type RepeatMode = "off" | "all" | "one";

type PlayerState = {
  queue: Track[];
  current: Track | null;
  index: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  liked: number[];
  playQueue: (tracks: Track[], startIndex?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleLike: (track: Track) => void;
  isLiked: (id: number) => boolean;
  addToQueue: (track: Track) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);
const LIKED_KEY = "wave:liked";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [liked, setLiked] = useState<number[]>([]);

  const current = index >= 0 ? (queue[index] ?? null) : null;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIKED_KEY);
      if (raw) setLiked(JSON.parse(raw) as number[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persistLiked = (ids: number[]) => {
    setLiked(ids);
    try {
      localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  };

  // Load & play the current track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current?.previewUrl) return;
    audio.src = current.previewUrl;
    audio.load();
    void audio.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false),
    );
  }, [current?.trackId, current?.previewUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = muted;
    }
  }, [volume, muted]);

  const next = useCallback(() => {
    setIndex((i) => {
      if (queue.length === 0) return -1;
      if (shuffle) {
        if (queue.length === 1) return i;
        let r = i;
        while (r === i) r = Math.floor(Math.random() * queue.length);
        return r;
      }
      if (i + 1 < queue.length) return i + 1;
      return repeat === "all" ? 0 : i;
    });
  }, [queue.length, shuffle, repeat]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const handleEnded = useCallback(() => {
    const audio = audioRef.current;
    if (repeat === "one" && audio) {
      audio.currentTime = 0;
      void audio.play();
      return;
    }
    const isLast = index === queue.length - 1;
    if (isLast && repeat === "off" && !shuffle) {
      setIsPlaying(false);
      return;
    }
    next();
  }, [repeat, index, queue.length, shuffle, next]);

  const value = useMemo<PlayerState>(
    () => ({
      queue,
      current,
      index,
      isPlaying,
      progress,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      liked,
      playQueue: (tracks, startIndex = 0) => {
        const playable = tracks.filter((t) => t.previewUrl);
        if (playable.length === 0) return;
        const target = tracks[startIndex];
        const idx = target ? playable.findIndex((t) => t.trackId === target.trackId) : 0;
        setQueue(playable);
        setIndex(idx >= 0 ? idx : 0);
      },
      toggle: () => {
        const audio = audioRef.current;
        if (!audio || !current) return;
        if (audio.paused) {
          void audio.play().then(() => setIsPlaying(true));
        } else {
          audio.pause();
          setIsPlaying(false);
        }
      },
      next,
      prev,
      seek: (seconds) => {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = seconds;
          setProgress(seconds);
        }
      },
      setVolume: (v) => {
        setVolumeState(v);
        setMuted(v === 0);
      },
      toggleMute: () => setMuted((m) => !m),
      toggleShuffle: () => setShuffle((s) => !s),
      cycleRepeat: () =>
        setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
      toggleLike: (track) =>
        persistLiked(
          liked.includes(track.trackId)
            ? liked.filter((id) => id !== track.trackId)
            : [track.trackId, ...liked],
        ),
      isLiked: (id) => liked.includes(id),
      addToQueue: (track) => {
        if (!track.previewUrl) return;
        setQueue((q) => {
          if (q.length === 0) {
            setIndex(0);
            return [track];
          }
          return [...q, track];
        });
      },
    }),
    [queue, current, index, isPlaying, progress, duration, volume, muted, shuffle, repeat, liked, next, prev],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

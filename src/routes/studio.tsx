import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Disc3, Pause, Play, RefreshCw, Save } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useBeatEngine } from "@/hooks/use-beat-engine";
import { MOODS, type Mood } from "@/lib/mood";
import { INSTRUMENTS, STYLES, makePattern, readCreations, writeCreations, type BeatPattern, type SavedBeat, type StudioStyle } from "@/lib/studio";
import { cn } from "@/lib/utils";

const studioSearch = z.object({
  mood: z.enum(MOODS).optional().catch(undefined),
  style: z.enum(STYLES).optional().catch(undefined),
  edit: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/studio")({
  validateSearch: studioSearch,
  head: () => ({ meta: [
    { title: "Wavely Studio — Create Your Sound" },
    { name: "description", content: "Build and save your own beat with Wavely's easy 16-step music studio." },
    { property: "og:title", content: "Wavely Studio — Create Your Sound" },
    { property: "og:description", content: "Build and save your own beat with Wavely's easy 16-step music studio." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: StudioPage,
});

const defaultBpm: Record<Mood, number> = { Happy: 118, Sad: 76, Energetic: 138, Chill: 88, Romantic: 96, Focus: 82, Nostalgic: 105 };

function StudioPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/studio" });
  const initialMood = search.mood ?? "Chill";
  const initialStyle = search.style ?? "Lo-fi";
  const [mood, setMood] = useState<Mood>(initialMood);
  const [style, setStyle] = useState<StudioStyle>(initialStyle);
  const [pattern, setPattern] = useState<BeatPattern>(() => makePattern(initialMood, initialStyle));
  const [bpm, setBpm] = useState(defaultBpm[initialMood]);
  const [volume, setVolume] = useState(0.7);
  const [bass, setBass] = useState(2);
  const [treble, setTreble] = useState(1);
  const [reverb, setReverb] = useState(0.15);
  const [loop, setLoop] = useState(true);
  const [name, setName] = useState(`${initialMood} ${initialStyle} Beat`);
  const [saved, setSaved] = useState(false);
  const engine = useBeatEngine(pattern, bpm, loop);

  useEffect(() => {
    engine.setMix(volume, bass, treble, reverb);
  }, [volume, bass, treble, reverb]);

  useEffect(() => {
    if (!search.edit) return;
    const beat = readCreations().find((item) => item.id === search.edit);
    if (!beat) return;
    setName(beat.name); setMood(beat.mood); setStyle(beat.style); setBpm(beat.bpm); setPattern(beat.pattern);
  }, [search.edit]);

  const activeCount = useMemo(() => INSTRUMENTS.reduce((sum, instrument) => sum + pattern[instrument].filter(Boolean).length, 0), [pattern]);

  const chooseMood = (next: Mood) => {
    engine.stop(); setMood(next); setBpm(defaultBpm[next]); setPattern(makePattern(next, style)); setName(`${next} ${style} Beat`); setSaved(false);
  };
  const chooseStyle = (next: StudioStyle) => {
    engine.stop(); setStyle(next); setPattern(makePattern(mood, next)); setName(`${mood} ${next} Beat`); setSaved(false);
  };
  const toggleStep = (instrument: (typeof INSTRUMENTS)[number], index: number) => {
    setPattern((current) => ({ ...current, [instrument]: current[instrument].map((value, stepIndex) => stepIndex === index ? !value : value) }));
    setSaved(false);
  };
  const save = () => {
    const creations = readCreations();
    const id = search.edit ?? crypto.randomUUID();
    const beat: SavedBeat = { id, name: name.trim() || "Untitled Beat", mood, style, bpm, pattern, createdAt: Date.now() };
    writeCreations([beat, ...creations.filter((item) => item.id !== id)]);
    setSaved(true);
    void navigate({ search: { mood, style, edit: id }, replace: true });
  };

  return (
    <div className="min-h-full px-4 pb-12 pt-6 md:px-8">
      <header className="flex flex-col gap-2 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Create your sound</p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">Wavely Studio</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">Shape a beat one step at a time. No experience needed.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground"><Disc3 className={cn("text-primary", engine.playing && "animate-spin")} /> <strong className="text-foreground">{bpm} BPM</strong><span>·</span><span>Step {engine.step < 0 ? "—" : engine.step + 1}/16</span></div>
      </header>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0">
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <Selector label="Mood" values={MOODS} value={mood} onChange={(value) => chooseMood(value as Mood)} />
            <Selector label="Style" values={STYLES} value={style} onChange={(value) => chooseStyle(value as StudioStyle)} />
          </div>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface p-3 md:p-5">
            <div className="min-w-[680px]">
              <div className="mb-2 grid grid-cols-[5rem_repeat(16,1fr)] gap-1 text-center text-[10px] text-muted-foreground">
                <span />{Array.from({ length: 16 }, (_, i) => <span key={i}>{i + 1}</span>)}
              </div>
              <div className="space-y-2">
                {INSTRUMENTS.map((instrument) => (
                  <div key={instrument} className="grid grid-cols-[5rem_repeat(16,1fr)] items-center gap-1">
                    <span className="text-xs font-semibold">{instrument}</span>
                    {pattern[instrument].map((active, index) => (
                      <button key={index} onClick={() => toggleStep(instrument, index)} aria-label={`${instrument} step ${index + 1}`} aria-pressed={active} className={cn("aspect-square min-h-8 rounded border transition-all active:scale-90", index % 4 === 0 ? "border-border" : "border-border/50", active ? "bg-primary shadow-glow" : "bg-background hover:bg-accent", engine.step === index && "ring-2 ring-foreground ring-offset-1 ring-offset-surface")} />
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{activeCount} active steps · tap squares to shape the pattern</p>
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-bold">Music controls</h2>
          <div className="mt-4 flex gap-2">
            <Button onClick={engine.playing ? engine.stop : engine.play} className="flex-1 rounded-full">{engine.playing ? <Pause /> : <Play />}{engine.playing ? "Pause" : "Play"}</Button>
            <Button variant="outline" size="icon" aria-label="Regenerate beat" title="Regenerate beat" onClick={() => { engine.stop(); setPattern(makePattern(mood, style, true)); setSaved(false); }}><RefreshCw /></Button>
          </div>
          {engine.error && <p className="mt-3 text-xs text-destructive">{engine.error}</p>}
          <div className="mt-6 space-y-4">
            <Control label="Tempo" value={bpm} min={60} max={170} step={1} onChange={setBpm} suffix=" BPM" />
            <Control label="Volume" value={volume} min={0} max={1} step={0.01} onChange={setVolume} />
            <Control label="Bass" value={bass} min={-8} max={10} step={1} onChange={setBass} suffix=" dB" />
            <Control label="Treble" value={treble} min={-8} max={10} step={1} onChange={setTreble} suffix=" dB" />
            <Control label="Reverb" value={reverb} min={0} max={0.7} step={0.01} onChange={setReverb} />
            <label className="flex min-h-11 items-center justify-between border-t border-border pt-4 text-sm"><span>Loop pattern</span><input type="checkbox" checked={loop} onChange={(event) => setLoop(event.target.checked)} className="size-5 accent-primary" /></label>
          </div>
          <div className="mt-6 border-t border-border pt-5">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="beat-name">Beat name</label>
            <input id="beat-name" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
            <Button onClick={save} variant="secondary" className="mt-3 w-full"><Save />{saved ? "Saved" : search.edit ? "Update creation" : "Save to My Library"}</Button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Selector({ label, values, value, onChange }: { label: string; values: readonly string[]; value: string; onChange: (value: string) => void }) {
  return <div><p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p><div className="flex flex-wrap gap-2">{values.map((item) => <Button key={item} type="button" size="sm" variant={value === item ? "default" : "outline"} onClick={() => onChange(item)}>{item}</Button>)}</div></div>;
}

function Control({ label, value, min, max, step, onChange, suffix = "" }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; suffix?: string }) {
  return <label className="block"><span className="mb-2 flex justify-between text-xs"><span className="font-semibold text-muted-foreground">{label}</span><span>{Number.isInteger(value) ? value : Math.round(value * 100)}{suffix}</span></span><input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-accent accent-primary" /></label>;
}
import { useCallback, useEffect, useRef, useState } from "react";
import type { BeatPattern, Instrument } from "@/lib/studio";

type AudioNodes = {
  context: AudioContext;
  master: GainNode;
  bass: BiquadFilterNode;
  treble: BiquadFilterNode;
  dry: GainNode;
  wet: GainNode;
  reverb: ConvolverNode;
};

function noiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 0.25, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function useBeatEngine(pattern: BeatPattern, bpm: number, loop: boolean) {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState("");
  const nodesRef = useRef<AudioNodes | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const patternRef = useRef(pattern);
  const stepRef = useRef(0);
  patternRef.current = pattern;

  const ensureAudio = useCallback(() => {
    if (nodesRef.current) return nodesRef.current;
    const AudioConstructor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioConstructor) throw new Error("Your browser does not support the Studio audio engine.");
    const context = new AudioConstructor();
    const master = context.createGain();
    const bass = context.createBiquadFilter();
    const treble = context.createBiquadFilter();
    const dry = context.createGain();
    const wet = context.createGain();
    const reverb = context.createConvolver();
    bass.type = "lowshelf";
    bass.frequency.value = 220;
    treble.type = "highshelf";
    treble.frequency.value = 3000;
    const impulse = context.createBuffer(2, context.sampleRate * 1.2, context.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
    }
    reverb.buffer = impulse;
    bass.connect(treble);
    treble.connect(dry).connect(master);
    treble.connect(reverb).connect(wet).connect(master);
    master.connect(context.destination);
    nodesRef.current = { context, master, bass, treble, dry, wet, reverb };
    return nodesRef.current;
  }, []);

  const trigger = useCallback((instrument: Instrument, when: number) => {
    const nodes = nodesRef.current;
    if (!nodes) return;
    const { context, bass } = nodes;
    const gain = context.createGain();
    gain.connect(bass);
    if (instrument === "Kick") {
      const oscillator = context.createOscillator();
      oscillator.frequency.setValueAtTime(140, when);
      oscillator.frequency.exponentialRampToValueAtTime(45, when + 0.16);
      gain.gain.setValueAtTime(0.9, when);
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.22);
      oscillator.connect(gain); oscillator.start(when); oscillator.stop(when + 0.23);
    } else if (instrument === "Bass") {
      const oscillator = context.createOscillator();
      oscillator.type = "sawtooth";
      oscillator.frequency.value = [55, 65.41, 73.42, 82.41][stepRef.current % 4] ?? 55;
      gain.gain.setValueAtTime(0.22, when);
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.25);
      oscillator.connect(gain); oscillator.start(when); oscillator.stop(when + 0.26);
    } else {
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      source.buffer = noiseBuffer(context);
      filter.type = instrument === "Hi-hat" ? "highpass" : "bandpass";
      filter.frequency.value = instrument === "Hi-hat" ? 6500 : 1500;
      gain.gain.setValueAtTime(instrument === "Clap" ? 0.28 : 0.18, when);
      gain.gain.exponentialRampToValueAtTime(0.001, when + (instrument === "Hi-hat" ? 0.06 : 0.16));
      source.connect(filter).connect(gain); source.start(when); source.stop(when + 0.2);
    }
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPlaying(false);
    setStep(-1);
    stepRef.current = 0;
  }, []);

  const play = useCallback(async () => {
    try {
      const nodes = ensureAudio();
      await nodes.context.resume();
      setError("");
      setPlaying(true);
      const tick = () => {
        const current = stepRef.current;
        setStep(current);
        (Object.keys(patternRef.current) as Instrument[]).forEach((instrument) => {
          if (patternRef.current[instrument][current]) trigger(instrument, nodes.context.currentTime);
        });
        if (current === 15 && !loop) stop();
        else stepRef.current = (current + 1) % 16;
      };
      tick();
      timerRef.current = setInterval(tick, (60_000 / bpm) / 4);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Studio audio could not start.");
    }
  }, [bpm, ensureAudio, loop, stop, trigger]);

  useEffect(() => {
    if (!playing) return;
    stop();
    void play();
  }, [bpm]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    void nodesRef.current?.context.close();
  }, []);

  const setMix = useCallback((volume: number, bassGain: number, trebleGain: number, reverb: number) => {
    const nodes = ensureAudio();
    nodes.master.gain.value = volume;
    nodes.bass.gain.value = bassGain;
    nodes.treble.gain.value = trebleGain;
    nodes.dry.gain.value = 1 - reverb * 0.4;
    nodes.wet.gain.value = reverb;
  }, [ensureAudio]);

  return { playing, step, error, play, stop, setMix };
}

declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}
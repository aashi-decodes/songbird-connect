import { useEffect, useState } from "react";
import { AudioLines, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUOTES = [
  "Every day has a frequency waiting to be found.",
  "Let the next sound change the shape of this moment.",
  "A rhythm can take you somewhere words cannot.",
  "Press play on the version of today you want to feel.",
];

export function IntroExperience() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [quote, setQuote] = useState(0);

  useEffect(() => {
    if (!sessionStorage.getItem("wavely:intro-seen")) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => setQuote((current) => (current + 1) % QUOTES.length), 3600);
    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  const enter = () => {
    sessionStorage.setItem("wavely:intro-seen", "true");
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 700);
  };

  return (
    <div className={`intro-stage ${leaving ? "intro-stage-leaving" : ""}`}>
      <div className="intro-particles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <span key={index} />)}
      </div>
      <div className="intro-wave" aria-hidden="true">
        {Array.from({ length: 32 }, (_, index) => (
          <i key={index} style={{ animationDelay: `${index * -70}ms` }} />
        ))}
      </div>
      <div className="relative z-10 flex max-w-2xl flex-col items-center px-6 text-center">
        <div className="mb-7 grid size-16 place-items-center rounded-2xl border border-primary/30 bg-primary/10 shadow-glow">
          <AudioLines className="size-9 text-primary" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Wavely</p>
        <h1 className="mt-4 text-4xl font-extrabold md:text-7xl">Your world. Your rhythm.</h1>
        <div className="mt-6 min-h-14 max-w-xl text-base text-muted-foreground md:text-lg" aria-live="polite">
          <p key={quote} className="animate-fade-in">“{QUOTES[quote]}”</p>
        </div>
        <Button onClick={enter} size="lg" className="mt-8 h-12 rounded-full px-7 font-bold">
          Enter Wavely <ArrowRight />
        </Button>
      </div>
      <p className="intro-credit">Made with love AASHI GOEL</p>
    </div>
  );
}
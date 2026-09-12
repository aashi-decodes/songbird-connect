import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { art } from "@/lib/music";

export function AlbumCard({
  albumId,
  title,
  subtitle,
  artwork,
}: {
  albumId: number;
  title: string;
  subtitle: string;
  artwork: string;
}) {
  return (
    <Link
      to="/album/$albumId"
      params={{ albumId: String(albumId) }}
      className="group relative flex flex-col gap-3 rounded-xl bg-surface p-3 transition-colors hover:bg-surface-elevated"
    >
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={art(artwork, 400)}
          alt={`${title} cover art`}
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
        <span className="absolute bottom-2 right-2 grid size-10 translate-y-2 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-glow transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="size-4 translate-x-px fill-current" />
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}

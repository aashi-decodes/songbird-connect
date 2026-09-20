import { Link } from "@tanstack/react-router";
import { Home, Search, Library, AudioLines, Heart, SlidersHorizontal } from "lucide-react";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Your Library", icon: Library },
  { to: "/studio", label: "Studio", icon: SlidersHorizontal },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-2 bg-sidebar p-3 md:flex">
      <Link to="/" className="flex items-center gap-2 px-3 py-4">
        <AudioLines className="size-7 text-primary" />
        <span className="text-xl font-extrabold tracking-tight">Wavely</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-4 rounded-xl bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-primary/20">
            <Heart className="size-5 text-primary" />
          </span>
          <div>
            <p className="text-sm font-semibold">Liked Songs</p>
            <Link to="/library" className="text-xs text-muted-foreground hover:underline">
              Open playlist
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-auto px-3 pb-2 text-[11px] leading-relaxed text-muted-foreground">
        Plays 30-second previews from the public Apple Music catalog.
      </p>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="flex items-center justify-around border-t border-border bg-sidebar py-2 md:hidden">
      {links.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
          className="flex min-w-0 flex-col items-center gap-1 px-2 text-[10px] font-medium text-muted-foreground"
          activeProps={{ className: "text-primary" }}
        >
          <Icon className="size-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

# Song Universe

## Goal

Add a signature, cinematic music-discovery experience that lets listeners travel between real catalog songs without changing or disrupting Wavely’s existing Home, Search, Studio, Library, intro, or player behavior.

## Experience

- Add a prominent “Explore Song Universe 🪐” entry on Home and a dedicated `/universe` destination.
- Present Song Universe as an immersive, edge-to-edge dark green space with restrained stars, particles, depth, and motion-reduction support.
- Use the current playing song as the starting world when available; otherwise begin from a real catalog result and show a subtle generation state.
- Place the selected song and its real artwork at the center, with related catalog tracks orbiting as smaller planets and related artists represented as star nodes.
- Group nearby tracks by real catalog signals such as genre and artist similarity; do not fabricate song metadata.
- Selecting a planet recenters the universe around that track and fetches another real set of connections, enabling continuous exploration.
- Show a compact selected-song panel with artwork, title, artist, genre, preview play/pause, like, and queue actions using the existing player.
- Include visible zoom controls, reset/center control, drag-to-pan, wheel/pinch zoom, touch-friendly targets, and a clear Back to Home action.
- Keep the line “Explore music. Travel through sound.” as the experience’s restrained identity statement.

## Technical approach

- Add a focused catalog helper that builds related-song searches from the selected track’s existing artist and genre fields, deduplicates results, and returns only playable previews.
- Add a modular `SongUniverse` visualization component and small graph-layout utility so data loading, graph positioning, and interaction remain separable.
- Use a maintained pan/zoom interaction library for reliable mouse-wheel, trackpad, pinch, and touch support; render the visual field with scalable HTML/SVG layers and semantic Wavely tokens.
- Keep playback inside the existing `PlayerProvider`; the Universe will call the same play, pause, like, and queue actions as the rest of Wavely.
- Give `/universe` a focused full-screen shell while retaining the shared player, and restore the normal navigation shell everywhere else.
- Add unique Song Universe title, description, Open Graph, and Twitter metadata.

## Validation

- Verify Home → Universe → Home navigation and starting from both current-song and no-current-song states.
- Verify loading, related-song generation, repeated planet traversal, selection details, preview playback, liking, and queueing.
- Verify wheel zoom around the pointer, drag pan, zoom/reset controls, and touch gestures without page-scroll interference.
- Verify desktop and mobile framing, tap target sizing, reduced motion, empty/error states, and no overlaps with player controls.
- Recheck Home, Search, mood search, Studio, Library, liked songs, album pages, cinematic intro, and Apple preview playback.

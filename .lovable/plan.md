# Wavely Intro, Mood Search, and Studio

## Goal
Add a cinematic entrance, natural-language mood discovery, and a working beginner-friendly beat studio while preserving every existing catalog, player, queue, album, search, and liked-song feature.

## Experience

### 1. Cinematic intro
- Show a full-screen Wavely entrance before the current Home screen on the first visit of each browser session.
- Keep the existing dark green Wavely identity, adding a restrained animated waveform, floating music particles, soft depth, and motion-reduction support.
- Present the Wavely mark, “Your world. Your rhythm.”, rotating original music lines every 3–4 seconds, and an “Enter Wavely” action.
- Transition smoothly into the unchanged Home experience; the intro will not interrupt an already-playing track or reappear during normal navigation.

### 2. Mood-aware search
- Keep the current debounced song/artist/album search behavior.
- Change the prompt to “What are you feeling today?” and add chips for Happy, Sad, Energetic, Chill, Romantic, Focus, and Nostalgic.
- Add a lightweight natural-language interpreter for common feeling/activity phrases, including study, travel, workout, relaxation, romance, nostalgia, and sadness.
- Convert detected intent into catalog-friendly search phrases while still using the existing Apple music catalog functions.
- Show the detected mood clearly, preserve the user’s original query, and provide a way to search it literally when they intended an artist/song instead.
- Add “Can’t find exactly what you’re feeling? Create your own sound →” beneath mood results, carrying the detected mood/style into Studio.

### 3. Wavely Studio
- Add a Studio destination to desktop and mobile navigation and a compact “Create Your Sound” entry on Home.
- Build a dedicated Studio screen with mood and style selectors plus a 16-step sequencer for Kick, Snare, Hi-hat, Clap, and Bass.
- Implement real in-browser synthesis with the Web Audio API: percussion/noise voices, a tuned bass voice, stable scheduling, visual playhead, and looping.
- Add working Play/Pause, Regenerate, loop, BPM, master volume, bass, treble, and reverb controls.
- Generate useful starter patterns from the selected mood/style and accept mood/style query parameters from Search.
- Save named beat patterns locally, list them in “Your Library,” and allow reopening and deleting them. Existing liked songs remain untouched.
- Handle unsupported or blocked browser audio gracefully and unlock audio only after a user action.

## Technical approach
- Keep the Apple catalog and current player context unchanged except for layout awareness during the intro.
- Add focused modules for mood interpretation, Studio pattern types/storage, and the Web Audio sequencer engine.
- Keep Studio audio separate from catalog preview playback; starting Studio pauses only its own engine, and leaving Studio disposes timers/audio nodes cleanly.
- Use semantic theme tokens and existing Wavely typography/components; introduce only the new animation and Studio-specific tokens needed.
- Add unique metadata for the Studio page and preserve metadata on all current content routes.

## Validation
- Verify intro entry and reduced-motion behavior at desktop and mobile sizes.
- Verify literal search, mood phrases, mood chips, and Search → Studio preselection.
- Verify all sequencer rows, controls, looping, regeneration, save/reopen/delete, and cleanup on navigation.
- Confirm existing Home, albums, player controls, queue, likes, and library songs still work.

# IMPLEMENTATION PLAN: INDIAN POLITICS ARENA

## Overview
Develop a complete, fully playable 2D fighting game titled **INDIAN POLITICS ARENA** within the Vibe Arena ecosystem (`memeverse`). The game replaces FightKaro with 100% original identity, characters, arenas, artwork, combat engine, audio synthesis, and game modes.

---

## Architecture & Module Decomposition

```
memeverse/src/
  ├── components/games/indian-politics-arena/
  │     ├── IndianPoliticsArenaGame.tsx       # Primary Game Component & Screen Orchestrator
  │     ├── engine/
  │     │     ├── types.ts                    # Fighter, Move, Hitbox, State & Frame data types
  │     │     ├── constants.ts                # Constants, Roster definition, Move definitions
  │     │     ├── Fighter.ts                  # Fighter entity (state machine, physics, animations, hurtboxes)
  │     │     ├── CombatEngine.ts             # Collision detection, hitboxes, damage, combo counters
  │     │     ├── InputManager.ts             # Keyboard, P1/P2 split controls, Mobile touch controls
  │     │     ├── AIAgent.ts                  # Multi-difficulty AI (Easy, Normal, Hard heuristics)
  │     │     ├── ArenaRenderer.ts            # Canvas rendering for 4 animated arenas & parallax backgrounds
  │     │     ├── CharacterRenderer.ts        # Procedural & vector styling for 8 distinct political satire fighters
  │     │     ├── ParticleSystem.ts           # Hit sparks, dust clouds, energy waves, flash effects
  │     │     └── Camera.ts                   # Dynamic tracking camera with zoom and trauma-based screen shake
  │     ├── audio/
  │     │     └── FightingAudio.ts            # Procedural Web Audio synthesizers + Howler integration
  │     ├── ui/
  │     │     ├── LoadingScreen.tsx           # Satire notice + dynamic asset bar
  │     │     ├── MainMenuScreen.tsx          # Vibe Arena branded title screen
  │     │     ├── ModeSelectModal.tsx         # Quick Fight, Story Mode, 2P Local, Multiplayer
  │     │     ├── CharacterSelectScreen.tsx   # 8-fighter interactive grid + stage + difficulty pickers
  │     │     ├── FightHUD.tsx                # Health bars, combo counters, Shakti super meter, timer
  │     │     ├── PauseModal.tsx              # "Chai Break" pause menu
  │     │     ├── VictoryNewspaper.tsx        # "The Daily Jumla" satirical newspaper result screen
  │     │     ├── MobileVirtualControls.tsx   # Touch joystick + action buttons cluster
  │     │     └── MultiplayerLobbyModal.tsx   # Room creation, code sharing, player sync
  │     └── assets/
  │           ├── characterArt.ts             # Vector / SVG data & portraits for the 8 characters
  │           └── arenaArt.ts                 # Canvas environment layers for the 4 arenas
  ├── app/games/indian-politics-arena/
  │     └── page.tsx                          # Direct dedicated full-page route
  ├── app/api/rooms/
  │     └── [roomCode]/route.ts               # Enhanced real-time signaling for fighting game state
  └── store/
        └── useAppStore.ts                    # Updated with Indian Politics Arena in catalog & high scores
```

---

## Detailed Task Breakdown

### Task 1: Engine Foundation & Data Schemas
- Define frame data interfaces (`Startup`, `Active`, `Recovery`, `Hitstun`, `Blockstun`, `Damage`, `Height`, `Reach`, `Knockdown`, `Launch`, `Pushback`).
- Define 8 original characters with distinct stats, moves, quotes, and descriptions.
- Define 4 original arenas with ambient lighting and color palettes.

### Task 2: Procedural Audio Engine (`FightingAudio.ts`)
- Punch impact (light, medium, heavy).
- Kick impact & body sweeps.
- Guard / block metallic thuds.
- Whiff / whoosh swing sounds.
- Super move charging hums & explosive detonators.
- Crowd cheering, round announcer bells, and countdown dings.
- Dynamic Indian fusion fight BGM loops.

### Task 3: Character & Arena Vector Visuals (`CharacterRenderer.ts`, `ArenaRenderer.ts`)
- Canvas-based rendering with expressive caricatures:
  - Chai Commander (kurta, spectacles, tea kettle aura)
  - Vikas Baba (heavy saffron shawl, bulldozer spirit)
  - Jumlebaaz (charismatic mic, wind illusion trails)
  - Dharna King (placard shield, protest bandana)
  - Budget Boss (briefcase hammer, GST tax stamps)
  - Media Master (breaking news boom mic, studio spotlights)
  - Coalition King (multi-colored flags, rotating ties)
  - Janata Hero (white cap, rolled sleeves, voting seal aura)
- Multi-layer parallax stages:
  - Parliament Arena (pillars, speaker chair, benches, tricolor)
  - Election Ground (stage, banners, waving crowd silhouttes)
  - Dharna Maidan (barricades, mist, streetlights, tents)
  - Newsroom Battle (studio screens, breaking news red-blue tickers)

### Task 4: Physics & Combat Engine
- Fixed 60 FPS update loop.
- Box-to-box Hurtbox vs Hitbox intersection tests.
- High, Mid, Low guard resolution.
- Combo counter and damage scaling.
- Juggle physics, air recovery, and wall collisions.
- Command grabs with unblockable state.
- Super move cinematic time-freeze and cinematic zoom.

### Task 5: AI System (`AIAgent.ts`)
- Easy: Reacts slowly, attacks predictably, rarely blocks.
- Normal: Uses combos, blocks predictable attacks, executes special moves when in range.
- Hard: Punishes on whiff, mixes up high/low/grab, combos into Super move on full Shakti.

### Task 6: UI Screens & Vibe Arena Branding
- Loading Screen with legal satire notice (Article 19(1)(a)).
- Main Menu with high-energy theme, sound toggle, mode select.
- Character Select Screen with 1P and CPU cursors, stat comparisons, arena preview.
- Fight HUD with smooth HP damage trails, super meter flash, round win dots, and breaking news ticker.
- Pause Modal ("Chai Break") with resume and sound toggles.
- Victory Newspaper ("The Daily Jumla") with satirical headlines, battle recap, and rematch button.
- Mobile Touch Overlay with joystick and action buttons.

### Task 7: Game Modes & Multiplayer
- Quick Fight (Instant CPU match).
- Story Mode (Progressive ladder against all 8 fighters with boss showdown).
- 2-Player Local Mode (Split keyboard controls).
- Online Multiplayer (Room creation, room joining, state transmission).

### Task 8: Integration & Routing
- Add game to `GAMES_CATALOG` in `memeverse/src/store/useAppStore.ts`.
- Add game renderer case in `memeverse/src/app/game/[id]/page.tsx`.
- Create direct route at `memeverse/src/app/games/indian-politics-arena/page.tsx`.
- Verify build, run tests, audit code quality, and push to GitHub.

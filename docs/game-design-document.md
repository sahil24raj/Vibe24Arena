# GAME DESIGN DOCUMENT: INDIAN POLITICS ARENA
**Title**: INDIAN POLITICS ARENA  
**Tagline**: "Sansad Se Sadak Tak, Fight Karo!"  
**Brand**: VIBE ARENA  
**Genre**: 2D Browser-Based Fighting Game (Arcade / Satire)  
**Target Platforms**: Web (Desktop Chrome/Safari/Firefox/Edge, Mobile iOS/Android WebViews & Browsers)  
**Engine**: HTML5 Canvas + Next.js App Router + TypeScript + Howler.js / Web Audio API + WebRTC / Realtime Room Synchronization

---

## 1. Game Concept & Pillar Values

### Core Pillars
1. **Snappy, Authentic Fighting Game Feel**: 60 FPS fixed-timestep physics, precise frame-data cancellations, hitboxes, blockstun, air juggles, and combo chains.
2. **Humorous Political Satire**: Exaggerated cartoon caricatures, comedic soundbites, satirical special moves, breaking news headlines, and satirical newspaper victory covers.
3. **Inclusive Playability**: Seamless controls for desktop keyboard warriors (single-player and split keyboard 2P) and ergonomic virtual touch buttons for mobile gamers.
4. **Instant Matchmaking & Real-Time Multiplayer**: Instant 4-character room codes with zero download required.

---

## 2. Character Roster (8 Original Satirical Fighters)

Each character is designed with distinctive stats, personality, and signature moves:

| Character | Archetype | Walk Speed | Damage Mul | Jump Height | Signature Special Move | Super Attack ("SHAKTI MAX") |
|---|---|---|---|---|---|---|
| **Chai Commander** | Balanced Leader | Normal (2.2) | 1.05x | Medium (7.8) | *Cutting Chai Splash* (Forward Punch) | **Chai Chakravyuh**: Whirlwind kettle geyser trapping opponent in boiling tea storm (32% dmg) |
| **Vikas Baba** | Heavy Bruiser | Slow (1.8) | 1.25x | Heavy (7.2) | *Highway Steamroller* (Forward Kick) | **Vikas Volcano**: Smashes the asphalt causing seismic ground eruptions (35% dmg) |
| **Jumlebaaz** | Agile Trickster | Fast (2.7) | 0.90x | High (8.4) | *15 Lakh Mirage* (Forward Punch) | **Jumla Storm**: Multitude of illusionary clones showering false promises and shockwaves (28% dmg) |
| **Dharna King** | Defensive Wall | Steady (2.0) | 1.00x | Medium (7.6) | *Barricade Buster* (Forward Punch) | **Protest Power**: Summons an impassable wall of placards and crowd roar (30% dmg) |
| **Budget Boss** | Heavyweight Grappler | Slow (1.9) | 1.20x | Low (7.0) | *GST Squeeze* (Grab / Forward Kick) | **Tax Attack**: Giant falling briefcase stamping 28% GST surcharge onto opponent (34% dmg) |
| **Media Master** | Long-Range Zoner | Fast (2.4) | 0.95x | High (8.0) | *Mic Drop Projectile* (Forward Punch) | **Breaking News Blast**: Array of flashing studio spotlights and decibel sirens (29% dmg) |
| **Coalition King** | Unpredictable Brawler | Normal (2.3) | 1.02x | High (8.2) | *Letter of Support* (Forward Kick) | **Alliance Attack**: Pulls the rug with sudden switching alliances causing heavy knockback (31% dmg) |
| **Janata Hero** | All-Rounder Commoner | Normal (2.4) | 1.00x | Medium (7.9) | *Common Man Punch* (Forward Punch) | **Public Power**: Waves of voting slip cyclones delivering justice for all (30% dmg) |

---

## 3. Arenas & Environments

1. **PARLIAMENT ARENA (Sansad Bhavan)**
   - *Visuals*: Grand circular colonnade, Lok Sabha green carpets, central speaker's chair, golden chandeliers, and fluttering tricolor flags.
   - *Atmosphere*: Shouts of "Order! Order!", gavel thumps, dramatic overhead spotlighting.

2. **ELECTION GROUND (Rally Maidan)**
   - *Visuals*: High campaign stage with saffron-blue-green ribbon bunting, loudspeakers on poles, sea of animated cheering rally spectators.
   - *Atmosphere*: Megaphone echoes, celebratory dhol beats, fluttering confetti.

3. **DHARNA MAIDAN (Jantar Mantar Road)**
   - *Visuals*: Police barricades, street lamps, protest tents, chai stalls, autumn Delhi mist.
   - *Atmosphere*: Slogan chants, sirens, whistling night breeze.

4. **NEWSROOM BATTLE (Prime Time Studio)**
   - *Visuals*: High-tech glossy television debate floor, multi-monitor video walls, neon ticker tape banners, studio boom cameras.
   - *Atmosphere*: Aggressive debate buzzer noises, breaking news jingles, flashbulbs.

---

## 4. Combat System & Move Architecture

### 1. Frame-Data State Machine
Every character moves through deterministic states:
- `IDLE` (looped breathing, balance stance)
- `WALK_FWD` / `WALK_BACK`
- `CROUCH` (low profile, blocks low)
- `JUMP_SQUAT` (3f) -> `JUMP_RISE` -> `JUMP_FALL` -> `LANDING` (4f recovery)
- `ATTACK` (subdivided into `Startup`, `Active`, and `Recovery` phases)
- `HITSTUN` (reeling backward, vulnerable to combo juggles)
- `BLOCKSTUN` (defending with guard animation, takes reduced pushback/zero damage)
- `KNOCKDOWN` (swept off feet onto ground)
- `GETUP` (invulnerable wakeup window)
- `SUPER_CINEMATIC` (screen freeze, dramatic banner, high-damage signature sequence)

### 2. Combo Chains
- **Triple Jab Combo**: Jab (`J`) -> Cross (`J`) -> Uppercut (`J`) [Knockdown Launch]
- **Brawler Combo**: Jab (`J`) -> Cross (`J`) -> Finisher (`K`) [Wall Bounce]
- **Low Target Mixup**: Low Jab (`↓J`) -> Sweep (`↓K`) [Trips opponent]
- **Aerial Intercept**: Air Punch (`Air J`) -> Air Kick (`Air K`)
- **Command Grab**: Grab (`I` or `J+K`) bypasses guard, grabs opponent by collar, slams them onto ground.

---

## 5. Game Modes

1. **Quick Fight**:
   - Instant 1P vs CPU battle.
   - Custom character, opponent, arena, and CPU difficulty (Easy, Normal, Hard).
2. **Story Mode / Kursi Ladder**:
   - Climb the political ladder by defeating 7 rival candidates in sequence.
   - Final Boss: The Grand Chairkeeper ("Kursi Master").
   - Cutscene dialogue before each match and victory newspaper finale.
3. **Two Player Local (Shared Keyboard)**:
   - Player 1: `W/A/S/D` for movement, `J` (Punch), `K` (Kick), `U` (Grab), `I` (Super), `Space` (Block).
   - Player 2: `Arrow Keys` for movement, `Numpad 1` / `B` (Punch), `Numpad 2` / `N` (Kick), `Numpad 4` / `H` (Grab), `Numpad 5` / `M` (Super), `Numpad 0` / `L` (Block).
4. **Online Multiplayer**:
   - Room Code generation (4-character alphanumeric code).
   - Direct link sharing & WhatsApp invite.
   - Real-time client-to-client state synchronization with low-latency rollback / state interpolation.

---

## 6. Audio Design

- **Synthesized Dynamic SFX**: High-impact punches, kicks, whooshes, block thuds, body slams, electrical super hums, crowd cheers, and timer dings.
- **Background Music**: Dynamic high-energy Indian fusion beat with dhol, sitar riffs, and modern synth-bass.
- **Voiceover & Announcer**: Humorous commentator callouts ("FIGHT!", "KAUN BANEGA WINNER?", "BAWAAL!", "SUPER CHAKRA!", "K.O.!").

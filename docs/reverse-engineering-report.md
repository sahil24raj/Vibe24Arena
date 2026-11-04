# REVERSE ENGINEERING REPORT: SANSAD SHOWDOWN / FIGHTKARO
**Subject Target**: https://fightkaro.com/ (Sansad Showdown)  
**Analysis Date**: November 2026  
**Auditor**: Senior Game Reverse Engineer & Frontend Architect  
**Project**: INDIAN POLITICS ARENA (Powered by Vibe Arena)

---

## 1. Executive Summary

`fightkaro.com` (titled "Sansad Showdown — Political Satire Fighter") is a client-side 2D/pseudo-3D arcade fighting game rendered in HTML5 Canvas using Three.js for characters and environments, coupled with a customized Web Audio sound synthesizer and WebRTC peer-to-peer data channel multiplayer network stack. 

The game combines traditional fighting game mechanics (frame data, startup/active/recovery windows, high/mid/low block heights, hitstun, pushback, wall bounds, combos, super bars) with humorous Indian political satire themes.

---

## 2. Technical Stack & Architecture

- **Rendering Engine**: WebGL / Canvas (`<canvas id="game"></canvas>`) powered by Three.js (`three-BbEF-ZsN.js`) with stylized procedural cel-shaded characters and stage environments.
- **Game Loop**: Standard `requestAnimationFrame` loop with fixed timestep sub-stepping for collision physics, animation tick, and frame-accurate combat evaluation.
- **Audio System**: Web Audio API oscillator synthesis + compressed audio playback with dynamic compression bus (`createDynamicsCompressor`), master/sfx/voice gain buses, and touch/click autoplay unlock.
- **Networking & Multiplayer**: WebRTC PeerConnection with RTCDataChannel for real-time low-latency P2P state synchronization, using a lightweight HTTP signaling relay (`/api/room` for SDP offer/answer/ICE exchange).
- **DOM HUD & Overlays**: HTML5 DOM overlay (`#hud`, `#cinema`, `#touch`, `#select`, `#online`, `#pause`, `#result`) synced to game state for crisp typography, mobile touch controls, and newspaper victory mastheads.

---

## 3. Game Structure & Screen Flows

```
[Loading Screen] 
       │ (Assets & Shaders cached)
       ▼
 [Opening Legal / Satire Notice (Article 19(1)(a) disclaimer)]
       │ (Agreed / Dismissed)
       ▼
 [Title / Main Menu Screen]
       │
       ├─► [Character Select Screen] ◄──────┐
       │         │                           │
       │         ├─► Select 1P Character    │
       │         ├─► Select CPU Opponent    │
       │         ├─► Select Stage / Arena   │
       │         ├─► Select CPU Difficulty  │
       │         │                           │
       │         └─► [Fight Screen]          │
       │                   │                 │
       │                   ├─► Pause Menu ───┤
       │                   │                 │
       │                   └─► [Result / Newspaper Screen]
       │                             │
       │                             ├─► Rematch (instant restart)
       │                             └─► Back to Character Select
       │
       └─► [Online Multiplayer Lobby]
                 ├─► Host Room (Generate 4-6 char Room Code, copy link / WhatsApp share)
                 ├─► Join Room (Enter Code, WebRTC SDP handshake)
                 └─► Synced Character Select ──► Synced Fight Screen
```

---

## 4. Combat Mechanics & Frame Data Analysis

Through deep inspection of `fightkaro_main.js`, the exact fighting engine parameters and move tables were extracted:

### A. Attack Table & Frame Data

| Move ID | Input Trigger | Startup (frames) | Active (frames) | Recovery (frames) | Damage | Height | Reach | Hitstun | Blockstun | Knockdown | Launch | Pushback | Lunge | Chains Into |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **jab** | Neutral J (Punch) | 5 | 3 | 10 | 5 | high | 1.00 | 16 | 10 | No | 0 | 1.6 | 0.8 | cross, kick |
| **cross** | J after Jab | 6 | 3 | 12 | 6 | high | 1.05 | 18 | 11 | No | 0 | 1.8 | 1.0 | uppercut, finisher |
| **kick** | Neutral K (Kick) | 9 | 4 | 15 | 9 | mid | 1.30 | 22 | 13 | No | 0 | 2.0 | 0.6 | roundhouse |
| **uppercut** | J after Cross | 9 | 4 | 20 | 11 | mid | 1.05 | 24 | 15 | Yes | 8.0 | 1.4 | 0.9 | - |
| **roundhouse** | K after Kick | 11 | 5 | 22 | 13 | high | 1.45 | 26 | 16 | Yes | 5.0 | 4.5 | 0.8 | - |
| **finisher** | K after Cross | 10 | 4 | 20 | 12 | mid | 1.35 | 24 | 15 | Yes | 5.5 | 3.5 | 1.2 | - |
| **lowJab** | Crouch + J | 6 | 3 | 11 | 4 | low | 1.00 | 18 | 9 | No | 0 | 1.2 | 0.4 | uppercut, sweep |
| **sweep** | Crouch + K | 11 | 4 | 20 | 8 | low | 1.40 | 22 | 14 | Yes | 3.2 | 1.6 | 0.4 | - |
| **special1** | Forward + J | 13 | 4 | 19 | 13 | mid | 1.10 | 26 | 16 | Yes | 7.5 | 2.2 | 1.8 | finisher |
| **special2** | Forward + K | 15 | 5 | 20 | 14 | mid | 1.55 | 26 | 16 | Yes | 4.5 | 5.2 | 1.4 | - |
| **airPunch** | Jump + J | 4 | 10 | 0 | 6 | mid | 0.95 | 14 | 11 | No | 0 | 2.0 | 0 | - |
| **airKick** | Jump + K | 7 | 12 | 0 | 8 | mid | 1.05 | 16 | 12 | No | 0 | 2.2 | 0 | - |
| **grab** | I or J+K | 6 | 3 | 24 | 16 | high | 0.95 | 0 | 0 | Yes | 3.0 | 0 | 0.6 | - (Unblockable close-range throw) |

### B. Defensive & Guard Mechanics
1. **High/Mid Guard**: Holding backwards while standing blocks `high` and `mid` attacks.
2. **Low Guard**: Holding down-back blocks `low` and `mid` attacks, but whiffs/vulnerable to overheads/air attacks.
3. **Guard Stun**: Attacking on block yields `blockstun` (shorter than `hitstun`), preventing immediate retaliation until recovery.
4. **Chip Damage**: Blocked specials inflict minimal chip damage (~10-15%).
5. **Grab Priority**: Grab beats pure blocking at point-blank range, but whiffs if opponent crouches or jumps.

### C. Super Meter ("SHAKTI" System)
- Starts at 0% and caps at 100%.
- Building Shakti: Gained by landing hits (+6%), taking damage (+9%), and blocking (+3%).
- Super Move Activation: Pressing `L` or `Space` when Shakti reaches 100% unleashes an unblockable cinematic super move dealing ~30-35% maximum health damage, with a dramatic screen zoom and signature dialogue/cutscene.

### D. Round Structure
- **Round Duration**: 60 seconds countdown.
- **Win Condition**: Deplete opponent's 100 HP to 0 or have higher HP when timer reaches 0.
- **Match Format**: Best of 3 rounds (represented by win markers under each player's health bar).

---

## 5. Controls System

### Desktop (Keyboard)
- **Movement**: `A` / `D` or `ArrowLeft` / `ArrowRight`
- **Jump**: `W` or `ArrowUp`
- **Crouch**: `S` or `ArrowDown`
- **Guard / Block**: Hold Away / Back
- **Punch**: `J`
- **Kick**: `K`
- **Grab**: `I` or `J + K`
- **Super Attack**: `L` or `Space` (when Meter is Full)
- **Pause**: `Escape`
- **Music Mute / Toggle**: `M`
- **Sound Effects Toggle**: `N`

### Mobile (Touch Controls)
- **Virtual Analog Joystick / D-Pad**: Left thumb control for 8-way movement, jump, and crouch.
- **Action Buttons**: Right thumb cluster featuring:
  - Large **PUNCH** button
  - Large **KICK** button
  - Dedicated **GRAB** button
  - Glowing **SUPER** button (animates when Shakti is full)
- **Orientation Prompt**: Automatic full-screen landscape enforcement with rotate device prompt on portrait viewports.

---

## 6. Visual Design & Presentation Analysis

- **Color Palette & Themes**: High-contrast saturated Indian aesthetic (Saffron `#FF9933`, Royal Navy `#0A1128`, Gold `#FFD700`, Cyan `#2E9BFF`).
- **Camera System**: Dynamic fighting camera that tracks the midpoint between both fighters, zooming in during close-range melee exchanges and pulling back when fighters separate, with trauma-based screen shake on impactful hits.
- **Victory Presentation**: Fictional Hindi/English satirical newspaper front page ("The Daily Jumla" / "Breaking News") with the winner's photo, satirical headlines, quotes, and rematch buttons.

---

## 7. Strategic Recommendations for "INDIAN POLITICS ARENA"

To create a distinctly original, legally safe, and superior game for Vibe Arena:
1. **Original Satirical Roster**: Replace political figures with 8 distinct fictional political archetypes:
   - `Chai Commander`
   - `Vikas Baba`
   - `Jumlebaaz`
   - `Dharna King`
   - `Budget Boss`
   - `Media Master`
   - `Coalition King`
   - `Janata Hero`
2. **Original Custom Arenas**:
   - `Parliament Arena` (Lok Sabha inspired grand hall)
   - `Election Ground` (Rally podium with fluttering flags and cheering crowds)
   - `Dharna Maidan` (Street barricades, banners, and water cannons)
   - `Newsroom Battle` (Prime-time split-screen studio with ticker tape)
3. **Advanced 2D Fighting Engine**: Canvas-based 60 FPS physics, smooth sprite/bone animations, custom particle effects (sparks, dust trails, energy waves), and sound FX via Howler.js and Web Audio synthesis.
4. **Rich Game Modes**:
   - Quick Fight (vs CPU)
   - Story / Arcade Mode (Ladder through all 8 opponents to claim the Kursi)
   - Local 2-Player (Pass-and-play on shared keyboard: P1 WASD/JKL vs P2 Arrows/Numpad)
   - Real-Time Online Multiplayer (Room codes + live state sync)

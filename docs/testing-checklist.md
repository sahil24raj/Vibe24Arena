# TESTING CHECKLIST: INDIAN POLITICS ARENA

## Pre-Release QA Matrix

### 1. Navigation & Screen Flow
- [ ] Initial Loading Screen displays satire disclaimer notice.
- [ ] Dismissing disclaimer transitions smoothly to Main Menu.
- [ ] Main Menu options respond to click/touch: Quick Fight, Story Mode, 2P Local, Multiplayer, Roster, Settings.
- [ ] Character Select Screen renders all 8 fighters with active selection cursors.
- [ ] Both 1P and CPU can be chosen with responsive keyboard navigation and mouse/touch clicks.
- [ ] Arena selection cycles through Parliament Arena, Election Ground, Dharna Maidan, and Newsroom Battle.
- [ ] CPU difficulty toggles between Easy, Normal, and Hard.

### 2. Combat Engine & Controls (Desktop)
- [ ] Horizontal movement (A/D or Left/Right) moves fighter within arena bounds without escaping stage walls.
- [ ] Jump (W or Up) follows parabolic gravity curve with landing frame recovery.
- [ ] Crouch (S or Down) lowers fighter hurtbox and enables low attacks.
- [ ] Neutral Punch (J) triggers Jab (5f startup).
- [ ] Combo Jab -> Punch triggers Cross (6f startup).
- [ ] Combo Cross -> Punch triggers Uppercut (launcher).
- [ ] Neutral Kick (K) triggers Kick (9f startup).
- [ ] Combo Kick -> Kick triggers Roundhouse (knockdown).
- [ ] Crouch + Punch triggers Low Jab (low height).
- [ ] Crouch + Kick triggers Sweep (trips opponent).
- [ ] Forward + Punch triggers Character Signature Special 1.
- [ ] Forward + Kick triggers Character Signature Special 2.
- [ ] Grab (I or J+K) connects at close range and cannot be guarded by standing block.
- [ ] Holding backwards blocks high and mid attacks, incurring blockstun with reduced knockback.
- [ ] Holding down-back blocks low attacks.

### 3. Shakti Super Meter & Cinematics
- [ ] Super meter increases upon dealing damage, taking damage, and blocking.
- [ ] Super meter flashes with golden flame when 100% full.
- [ ] Pressing L or Spacebar activates Cinematic Super Attack.
- [ ] Game freezes time momentarily, displays character signature banner, zooms camera, and delivers ~30% damage.

### 4. Health, Timer & Round Logic
- [ ] Health bar smoothly decreases with yellow damage trail.
- [ ] Match timer counts down from 60 seconds.
- [ ] Depleting opponent HP triggers K.O. slow motion and victory sequence.
- [ ] Round win counters illuminate under the winning fighter's HUD side.
- [ ] Best of 3 rounds correctly triggers Match Win.

### 5. Pause & Victory Presentation
- [ ] Pressing Esc or Pause button brings up "Chai Break" modal.
- [ ] Resuming restores exact game state with zero desync.
- [ ] Victory screen renders "The Daily Jumla" newspaper with photo, headline, and funny excuses.
- [ ] Rematch button resets fighters and restarts match immediately without full reload.
- [ ] Character Select button returns to fighter roster.

### 6. Mobile & Touch Responsive Controls
- [ ] Virtual analog stick correctly maps movement, jump, and crouch.
- [ ] Virtual Punch, Kick, Grab, and Super buttons trigger corresponding moves accurately.
- [ ] Mobile landscape orientation lock / rotate prompt triggers on portrait orientation.
- [ ] UI elements scale cleanly on smartphones (375px - 850px) without overlapping action buttons.

### 7. Game Modes Verification
- [ ] **Quick Fight**: Plays custom match against selected CPU.
- [ ] **Story Mode**: Advances match-by-match through the ladder with stage progression.
- [ ] **2-Player Local**: P1 (WASD/JKL) and P2 (Arrows/Numpad) simultaneously control separate fighters.
- [ ] **Multiplayer**: Creates room code, joins room code, and synchronizes combat inputs.

### 8. Audio System
- [ ] Dynamic Web Audio synthesis plays punch, kick, hit, block, and super sounds.
- [ ] Background music plays cleanly and respects mute toggles.
- [ ] Mobile autoplay policy handles audio unlock on first user gesture.

### 9. Build, Performance & Zero Console Errors
- [ ] `npm run build` succeeds with zero TypeScript and ESLint errors.
- [ ] Frame rate maintains stable 60 FPS on standard desktop and mobile hardware.
- [ ] No unhandled Promise rejections or memory leaks in animation loops.

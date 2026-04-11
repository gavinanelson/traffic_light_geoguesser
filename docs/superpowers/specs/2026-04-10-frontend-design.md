# Frontend Design — Global Emergency Shift

Implements the gameplay front end described in `docs/2026-04-10-global-emergency-shift-design.md`.

## Decisions Made During Brainstorming

These points override or refine the original gameplay spec:

- **Guessing model**: preset candidate markers on the map (all round locations visible). Player clicks a marker to select, then confirms. Binary correct/incorrect.
- **Session structure**: an envelope of 10 photos. Score is X/10 correct.
- **Timer**: countdown from a player-chosen duration (90s, 3min, 5min). If time expires before all 10 are answered, only completed rounds count.
- **No streak mechanic**. No time penalty for wrong guesses. Simple: right or wrong, move to next photo.
- **Visual style**: analog dispatch desk — warm tones, paper/manila textures, typewriter/monospace fonts, rubber-stamp UI elements, aged-paper photo treatment.
- **Architecture**: single-page state machine (`briefing → shift → debrief`) with separate component files per screen.
- **Map theming**: dark tile provider with CSS filters for warmth, custom amber/brass marker styling.
- **Fiction**: full commitment — dispatch memos, packet IDs, stamp aesthetics, operator language throughout.

## File Structure

```
app/
  page.tsx                — "use client", state machine orchestrator, useReducer for game state
  globals.css             — base theme: analog dispatch desk palette and typography
  components/
    BriefingScreen.tsx    — fiction intro, rules, shift duration selector, start button
    ShiftScreen.tsx       — main gameplay: photo panel + map panel + HUD
    DebriefScreen.tsx     — end-of-shift summary, flavor text, replay button
    PacketPhoto.tsx       — manila-envelope styled image wrapper
    WorldMap.tsx          — Leaflet map with themed tiles, candidate markers, selection logic
    HUD.tsx               — top bar: progress (round N of 10), timer, correct count
    FeedbackOverlay.tsx   — brief correct/wrong result flash after each guess
lib/game/
  types.ts                — Round, GameState, ShiftResult, GameAction (extend existing file)
  score.ts                — existing distanceKm/scoreGuess stay as-is (unused by gameplay for now)
  engine.ts               — pure functions: processGuess, nextRound, isShiftOver
  rounds.ts               — load and shuffle rounds, select 10 for an envelope
```

## Types

```ts
// Extend existing types.ts

export type GamePhase = "briefing" | "shift" | "debrief";

export type ShiftResult = {
  correct: number;         // how many right out of 10
  total: number;           // how many rounds were attempted (may be <10 if time ran out)
  roundResults: RoundFeedback[];
  durationSeconds: number; // the chosen shift length
  timeUsed: number;        // seconds actually spent
};

export type GameState = {
  phase: GamePhase;
  rounds: Round[];         // the 10 selected rounds for this envelope
  currentRoundIndex: number;
  correct: number;
  timeRemaining: number;   // seconds
  durationSeconds: number;
  feedback: RoundFeedback | null;
  roundResults: RoundFeedback[];
};

export type RoundFeedback = {
  correct: boolean;
  chosenId: string;
  correctId: string;
};

export type GameAction =
  | { type: "START_SHIFT"; durationSeconds: number }
  | { type: "SUBMIT_GUESS"; chosenId: string }
  | { type: "DISMISS_FEEDBACK" }
  | { type: "TICK" }
  | { type: "PLAY_AGAIN" };
```

## State Machine

`page.tsx` uses `useReducer(gameReducer, initialState)`.

```
BRIEFING
  ├─ START_SHIFT(duration) → pick 10 rounds, shuffle, set timer, phase = "shift"

SHIFT
  ├─ SUBMIT_GUESS(chosenId) → check if correct, record result, set feedback
  ├─ DISMISS_FEEDBACK → advance to next round; if round 10 complete, phase = "debrief"
  ├─ TICK → decrement timeRemaining; if 0, phase = "debrief"

DEBRIEF
  ├─ PLAY_AGAIN → reset state, phase = "briefing"
```

The `TICK` action fires from a `setInterval` (1 second) started when the shift begins and cleared when the shift ends.

## Scoring Logic (engine.ts)

```ts
function processGuess(state: GameState, chosenId: string): RoundFeedback {
  const currentRound = state.rounds[state.currentRoundIndex];
  return {
    correct: chosenId === currentRound.id,
    chosenId,
    correctId: currentRound.id,
  };
}
```

No points, no streak, no penalties. Just correct or not. The debrief shows X/10.

## Screen Designs

### 1. Briefing Screen

**Visual:** typed memo on aged paper, centered on a dark desk surface.

**Content (top to bottom):**
- Title: "GLOBAL EMERGENCY SHIFT" in stencil/stamp type
- Dispatch memo (2-3 sentences): cyberattack premise, mailed packets, operator's job
- Rules card styled as a field instruction slip:
  - An envelope of 10 camera photos has arrived at your desk
  - Select the matching location on the map for each photo
  - Work quickly — your shift timer is running
  - You will be graded on how many you verify correctly out of 10
- Shift duration selector: 3 buttons styled as shift-clock punch cards — **90s**, **3 min**, **5 min**
- Start button: "BEGIN SHIFT" with rubber-stamp aesthetic

**Props:** `onStartShift(durationSeconds: number)`

### 2. Shift Screen

**Layout:** HUD bar across top, two-panel below (left: photo, right: map).

#### HUD (top bar)
- Progress: "PACKET 4 OF 10"
- Timer: countdown mm:ss
- Correct count: "VERIFIED: 3"
- Dispatch line: "Verify all intersections before shift handoff"

Styled as a desk header strip — dark wood tone, monospace, amber text.

#### Left Panel — PacketPhoto
- Manila envelope/folder wrapper around the image
- Packet label: "PKT-XXXX" derived from round ID (anonymized, no city name leak)
- Photo with subtle aging CSS: `filter: sepia(0.15) contrast(1.05)` plus a faint paper-grain overlay
- "UNVERIFIED" rubber stamp in bottom-right corner

#### Right Panel — WorldMap
- **Tile provider:** CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)
- CSS filter on `.leaflet-tile-pane`: `sepia(0.3) hue-rotate(10deg) brightness(0.9)` to warm the tones
- **All candidate markers visible** on every round as small amber/brass circle markers
- Markers for already-verified rounds (correctly guessed earlier in this envelope) shown as muted green with a check style
- Markers for incorrectly guessed rounds shown as muted red
- Already-guessed markers (correct or incorrect) are not clickable — only unguessed candidates can be selected
- **Click an unguessed marker** to select it: selected marker enlarges, glows, and shows a label with city + country
- **Click a different marker** to change selection
- **"LOG LOCATION"** confirm button in a bar below the map — only active when a marker is selected

#### FeedbackOverlay
Appears briefly (1.5-2 seconds) after confirming a guess:
- **Correct:** green-tinted flash, "VERIFIED" text, the marker turns verified style
- **Wrong:** red-tinted flash, "INCORRECT — [correct city] was the target", correct marker briefly highlighted
- Auto-advances to next packet after the overlay dismisses

**Timer urgency:** in the last 30 seconds the timer text pulses or shifts to a warning color.

**Props:** `rounds: Round[]`, `durationSeconds: number`, `onShiftEnd(result: ShiftResult)`

### 3. Debrief Screen

**Visual:** carbon-copy shift report on aged paper.

**Content:**
- Header: "SHIFT DEBRIEF" in stencil type
- Results card:
  - Score: **X / 10** verified (large, prominent)
  - Rounds attempted (may be less than 10 if time ran out)
  - Time used
  - Shift duration selected
- Flavor text scaled to performance:
  - 9-10: "Outstanding work. Emergency coordinators now have a viable routing backbone for 3 continental zones."
  - 5-8: "Shift logged. Your verifications have been forwarded to the regional routing desk."
  - 0-4: "Partial coverage filed. The next shift will continue where you left off."
- "NEW SHIFT" button — rubber-stamp style, returns to briefing

**Props:** `result: ShiftResult`, `onPlayAgain()`

## Visual Theme — Analog Dispatch Desk

### Palette
- **Background/desk surface:** `#1a1208` to `#2a1f14` (dark warm brown)
- **Paper/envelope:** `#c4a862` (manila gold)
- **Text primary:** `#e8d5b0` (warm cream)
- **Text secondary:** `#c4a97d` (muted amber)
- **Text muted:** `#8a7454` (faded brown)
- **Accent/active:** `#d4a24e` (brass/amber)
- **Danger/stamp:** `#8b0000` (dark red)
- **Success/verified:** `#4a7a4a` (muted olive green)
- **Borders/dividers:** `#3d2e1a` (dark wood)

### Typography
- Primary: `'Courier New', 'Courier', monospace` — typewriter feel throughout
- Headings: uppercase, letter-spacing `0.1em`, for stencil/stamp effect
- Body: normal weight, standard tracking

### Textures (CSS only, no image assets)
- Aged paper: subtle CSS gradient noise or `repeating-linear-gradient` grain
- Manila envelope: solid warm gold with slight shadow
- Rubber stamps: bordered text, slight rotation (`transform: rotate(-2deg)`), reduced opacity
- Wood desk: dark gradient or solid dark-brown background

### Map Theming
- Tile layer: CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)
- CSS filter on `.leaflet-tile-pane`: `sepia(0.3) hue-rotate(10deg) brightness(0.9)`
- Custom marker icons: amber circles with brass border, CSS-only (no image sprites)
- Selected marker: larger, glowing box-shadow, label tooltip
- Verified marker: muted green fill
- Incorrect marker: muted red fill

## Data Loading (rounds.ts)

```ts
import type { Round } from "./types";

// In production: rounds.json is populated by the ingestion pipeline
// In development: fall back to raw-webcams.json if rounds.json is empty

export function loadRounds(): Round[] {
  // Implementation loads from JSON, maps raw webcam fields to Round shape if needed
}

export function selectEnvelope(rounds: Round[], count = 10): Round[] {
  const shuffled = [...rounds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
```

Since the ingestion pipeline is being built separately, the frontend should gracefully handle an empty `rounds.json` by falling back to `raw-webcams.json` for development. The `Round` type already matches the shape exported by `export-approved.ts`. The raw webcam data has extra fields (`webcamId`, `title`, `providerUrl`, etc.) which are ignored.

## Scope Boundaries

**In scope:**
- All three screens (briefing, shift, debrief)
- 10-photo envelope session structure
- Timer with player-selected countdown duration
- Binary correct/incorrect, scored X/10
- Themed Leaflet map with candidate markers
- Manila-packet photo presentation
- Immediate round feedback
- Full fiction layer (dispatch memos, stamps, operator language)

**Out of scope:**
- Sound effects
- Animations beyond simple CSS transitions
- Mobile/responsive layout (desktop-first for MVP)
- Keyboard shortcuts
- Backend persistence / leaderboards
- The ingestion pipeline (built separately)
- Distance-based scoring (existing functions preserved but unused)
- Streak mechanic

# Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the playable frontend for Global Emergency Shift — 3 screens (briefing, shift, debrief), an analog dispatch desk visual theme, and a 10-photo envelope gameplay loop with a timed countdown and binary correct/incorrect scoring against preset map markers.

**Architecture:** Single Next.js page (`app/page.tsx`) with `useReducer` state machine cycling through `briefing → shift → debrief`. Each screen is its own component file. Game logic is pure functions in `lib/game/`. Leaflet map is dynamically imported (no SSR). All styling via CSS classes in `globals.css`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Leaflet + react-leaflet, vitest for testing.

**Spec:** `docs/superpowers/specs/2026-04-10-frontend-design.md`

---

### Task 1: Game Types

Extend `lib/game/types.ts` with the types needed by the state machine, reducer, and all components.

**Files:**
- Modify: `lib/game/types.ts`

- [ ] **Step 1: Add game types to types.ts**

Append these types to the existing file (keep `Round`, `Guess` as-is):

```ts
export type GamePhase = "briefing" | "shift" | "debrief";

export type RoundFeedback = {
  correct: boolean;
  chosenId: string;
  correctId: string;
};

export type ShiftResult = {
  correct: number;
  total: number;
  roundResults: RoundFeedback[];
  durationSeconds: number;
  timeUsed: number;
};

export type GameState = {
  phase: GamePhase;
  rounds: Round[];
  currentRoundIndex: number;
  correct: number;
  timeRemaining: number;
  durationSeconds: number;
  feedback: RoundFeedback | null;
  roundResults: RoundFeedback[];
};

export type GameAction =
  | { type: "START_SHIFT"; durationSeconds: number; rounds: Round[] }
  | { type: "SUBMIT_GUESS"; chosenId: string }
  | { type: "DISMISS_FEEDBACK" }
  | { type: "TICK" }
  | { type: "PLAY_AGAIN" };
```

Note: `START_SHIFT` includes `rounds` so the reducer doesn't need to import round-loading logic. The page orchestrator will select the envelope and pass it in.

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/game/types.ts
git commit -m "feat: add game state types for frontend state machine"
```

---

### Task 2: Game Engine

Pure functions for the reducer and guess processing. Fully testable with no React or DOM dependencies.

**Files:**
- Create: `lib/game/engine.ts`
- Create: `tests/engine.test.ts`

- [ ] **Step 1: Write failing tests for the game reducer**

Create `tests/engine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { gameReducer, initialGameState } from "../lib/game/engine";
import type { GameState, Round } from "../lib/game/types";

const fakeRounds: Round[] = [
  { id: "london-1", image: "/rounds/london-1.jpg", lat: 51.5, lng: -0.1, city: "London", region: "England", country: "United Kingdom", source: "windy" },
  { id: "tokyo-2", image: "/rounds/tokyo-2.jpg", lat: 35.6, lng: 139.7, city: "Tokyo", region: "Kanto", country: "Japan", source: "windy" },
  { id: "sydney-3", image: "/rounds/sydney-3.jpg", lat: -33.8, lng: 151.2, city: "Sydney", region: "NSW", country: "Australia", source: "windy" },
];

describe("gameReducer", () => {
  describe("START_SHIFT", () => {
    it("transitions from briefing to shift with the given rounds and duration", () => {
      const state = gameReducer(initialGameState, {
        type: "START_SHIFT",
        durationSeconds: 180,
        rounds: fakeRounds,
      });
      expect(state.phase).toBe("shift");
      expect(state.rounds).toEqual(fakeRounds);
      expect(state.durationSeconds).toBe(180);
      expect(state.timeRemaining).toBe(180);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.correct).toBe(0);
      expect(state.feedback).toBeNull();
      expect(state.roundResults).toEqual([]);
    });
  });

  describe("SUBMIT_GUESS", () => {
    it("sets feedback with correct=true when the guess matches the current round", () => {
      const shiftState: GameState = {
        phase: "shift",
        rounds: fakeRounds,
        currentRoundIndex: 0,
        correct: 0,
        timeRemaining: 120,
        durationSeconds: 180,
        feedback: null,
        roundResults: [],
      };
      const state = gameReducer(shiftState, { type: "SUBMIT_GUESS", chosenId: "london-1" });
      expect(state.feedback).toEqual({
        correct: true,
        chosenId: "london-1",
        correctId: "london-1",
      });
      expect(state.correct).toBe(1);
      expect(state.roundResults).toHaveLength(1);
      expect(state.roundResults[0].correct).toBe(true);
    });

    it("sets feedback with correct=false when the guess is wrong", () => {
      const shiftState: GameState = {
        phase: "shift",
        rounds: fakeRounds,
        currentRoundIndex: 0,
        correct: 0,
        timeRemaining: 120,
        durationSeconds: 180,
        feedback: null,
        roundResults: [],
      };
      const state = gameReducer(shiftState, { type: "SUBMIT_GUESS", chosenId: "tokyo-2" });
      expect(state.feedback).toEqual({
        correct: false,
        chosenId: "tokyo-2",
        correctId: "london-1",
      });
      expect(state.correct).toBe(0);
      expect(state.roundResults).toHaveLength(1);
      expect(state.roundResults[0].correct).toBe(false);
    });
  });

  describe("DISMISS_FEEDBACK", () => {
    it("advances to the next round", () => {
      const state: GameState = {
        phase: "shift",
        rounds: fakeRounds,
        currentRoundIndex: 0,
        correct: 1,
        timeRemaining: 100,
        durationSeconds: 180,
        feedback: { correct: true, chosenId: "london-1", correctId: "london-1" },
        roundResults: [{ correct: true, chosenId: "london-1", correctId: "london-1" }],
      };
      const next = gameReducer(state, { type: "DISMISS_FEEDBACK" });
      expect(next.currentRoundIndex).toBe(1);
      expect(next.feedback).toBeNull();
      expect(next.phase).toBe("shift");
    });

    it("transitions to debrief when all rounds are complete", () => {
      const state: GameState = {
        phase: "shift",
        rounds: fakeRounds,
        currentRoundIndex: 2,
        correct: 2,
        timeRemaining: 50,
        durationSeconds: 180,
        feedback: { correct: true, chosenId: "sydney-3", correctId: "sydney-3" },
        roundResults: [
          { correct: true, chosenId: "london-1", correctId: "london-1" },
          { correct: false, chosenId: "london-1", correctId: "tokyo-2" },
          { correct: true, chosenId: "sydney-3", correctId: "sydney-3" },
        ],
      };
      const next = gameReducer(state, { type: "DISMISS_FEEDBACK" });
      expect(next.phase).toBe("debrief");
    });
  });

  describe("TICK", () => {
    it("decrements timeRemaining by 1", () => {
      const state: GameState = {
        phase: "shift",
        rounds: fakeRounds,
        currentRoundIndex: 0,
        correct: 0,
        timeRemaining: 60,
        durationSeconds: 180,
        feedback: null,
        roundResults: [],
      };
      const next = gameReducer(state, { type: "TICK" });
      expect(next.timeRemaining).toBe(59);
    });

    it("transitions to debrief when time reaches zero", () => {
      const state: GameState = {
        phase: "shift",
        rounds: fakeRounds,
        currentRoundIndex: 1,
        correct: 1,
        timeRemaining: 1,
        durationSeconds: 180,
        feedback: null,
        roundResults: [{ correct: true, chosenId: "london-1", correctId: "london-1" }],
      };
      const next = gameReducer(state, { type: "TICK" });
      expect(next.timeRemaining).toBe(0);
      expect(next.phase).toBe("debrief");
    });
  });

  describe("PLAY_AGAIN", () => {
    it("resets to initial briefing state", () => {
      const state: GameState = {
        phase: "debrief",
        rounds: fakeRounds,
        currentRoundIndex: 2,
        correct: 2,
        timeRemaining: 0,
        durationSeconds: 180,
        feedback: null,
        roundResults: [
          { correct: true, chosenId: "london-1", correctId: "london-1" },
          { correct: false, chosenId: "london-1", correctId: "tokyo-2" },
        ],
      };
      const next = gameReducer(state, { type: "PLAY_AGAIN" });
      expect(next).toEqual(initialGameState);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/engine.test.ts`
Expected: FAIL — `engine.ts` doesn't exist yet

- [ ] **Step 3: Implement the game reducer**

Create `lib/game/engine.ts`:

```ts
import type { GameState, GameAction, ShiftResult } from "./types";

export const initialGameState: GameState = {
  phase: "briefing",
  rounds: [],
  currentRoundIndex: 0,
  correct: 0,
  timeRemaining: 0,
  durationSeconds: 0,
  feedback: null,
  roundResults: [],
};

export function buildShiftResult(state: GameState): ShiftResult {
  return {
    correct: state.correct,
    total: state.roundResults.length,
    roundResults: state.roundResults,
    durationSeconds: state.durationSeconds,
    timeUsed: state.durationSeconds - state.timeRemaining,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_SHIFT":
      return {
        ...initialGameState,
        phase: "shift",
        rounds: action.rounds,
        durationSeconds: action.durationSeconds,
        timeRemaining: action.durationSeconds,
      };

    case "SUBMIT_GUESS": {
      if (state.phase !== "shift") return state;
      const currentRound = state.rounds[state.currentRoundIndex];
      const correct = action.chosenId === currentRound.id;
      const feedback = {
        correct,
        chosenId: action.chosenId,
        correctId: currentRound.id,
      };
      return {
        ...state,
        feedback,
        correct: state.correct + (correct ? 1 : 0),
        roundResults: [...state.roundResults, feedback],
      };
    }

    case "DISMISS_FEEDBACK": {
      if (state.phase !== "shift") return state;
      const nextIndex = state.currentRoundIndex + 1;
      const allDone = nextIndex >= state.rounds.length;
      return {
        ...state,
        feedback: null,
        currentRoundIndex: allDone ? state.currentRoundIndex : nextIndex,
        phase: allDone ? "debrief" : "shift",
      };
    }

    case "TICK": {
      if (state.phase !== "shift") return state;
      const next = state.timeRemaining - 1;
      if (next <= 0) {
        return { ...state, timeRemaining: 0, phase: "debrief" };
      }
      return { ...state, timeRemaining: next };
    }

    case "PLAY_AGAIN":
      return initialGameState;

    default:
      return state;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/engine.test.ts`
Expected: all 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/game/engine.ts tests/engine.test.ts
git commit -m "feat: add game reducer with full state machine logic"
```

---

### Task 3: Rounds Loading

Load round data and select a random 10-round envelope. Falls back to `raw-webcams.json` when `rounds.json` is empty.

**Files:**
- Create: `lib/game/rounds.ts`
- Create: `tests/rounds.test.ts`

- [ ] **Step 1: Write failing tests for rounds loading**

Create `tests/rounds.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { selectEnvelope, mapRawToRound } from "../lib/game/rounds";
import type { Round } from "../lib/game/types";

const fakeRounds: Round[] = Array.from({ length: 20 }, (_, i) => ({
  id: `city-${i}`,
  image: `/rounds/city-${i}.jpg`,
  lat: i,
  lng: i * 2,
  city: `City ${i}`,
  region: `Region ${i}`,
  country: `Country ${i}`,
  source: "windy" as const,
}));

describe("selectEnvelope", () => {
  it("returns exactly 10 rounds by default", () => {
    const envelope = selectEnvelope(fakeRounds);
    expect(envelope).toHaveLength(10);
  });

  it("returns a custom count when specified", () => {
    const envelope = selectEnvelope(fakeRounds, 5);
    expect(envelope).toHaveLength(5);
  });

  it("returns all rounds if pool is smaller than requested count", () => {
    const small = fakeRounds.slice(0, 3);
    const envelope = selectEnvelope(small, 10);
    expect(envelope).toHaveLength(3);
  });

  it("does not mutate the input array", () => {
    const copy = [...fakeRounds];
    selectEnvelope(fakeRounds);
    expect(fakeRounds).toEqual(copy);
  });
});

describe("mapRawToRound", () => {
  it("maps raw webcam fields to Round shape", () => {
    const raw = {
      id: "london-123",
      imagePath: "/rounds/london-123.jpg",
      lat: 51.5,
      lng: -0.1,
      city: "London",
      region: "England",
      country: "United Kingdom",
      webcamId: 123,
      title: "London: Something",
      providerUrl: "http://example.com",
      windyDetailUrl: "http://windy.com/123",
      categories: ["traffic"],
      capturedAt: "2026-04-10T00:00:00Z",
    };
    const round = mapRawToRound(raw);
    expect(round).toEqual({
      id: "london-123",
      image: "/rounds/london-123.jpg",
      lat: 51.5,
      lng: -0.1,
      city: "London",
      region: "England",
      country: "United Kingdom",
      source: "windy",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/rounds.test.ts`
Expected: FAIL — `rounds.ts` doesn't exist yet

- [ ] **Step 3: Implement rounds loading**

Create `lib/game/rounds.ts`:

```ts
import type { Round } from "./types";

type RawWebcam = {
  id: string;
  imagePath: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  country: string;
  [key: string]: unknown;
};

export function mapRawToRound(raw: RawWebcam): Round {
  return {
    id: raw.id,
    image: raw.imagePath,
    lat: raw.lat,
    lng: raw.lng,
    city: raw.city,
    region: raw.region,
    country: raw.country,
    source: "windy",
  };
}

export function selectEnvelope(rounds: Round[], count = 10): Round[] {
  const shuffled = [...rounds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export async function loadRounds(): Promise<Round[]> {
  const roundsMod = await import("../../data/rounds.json");
  const rounds: Round[] = roundsMod.default;
  if (rounds.length > 0) return rounds;

  const rawMod = await import("../../data/raw-webcams.json");
  const raw: RawWebcam[] = rawMod.default;
  return raw.map(mapRawToRound);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/rounds.test.ts`
Expected: all 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/game/rounds.ts tests/rounds.test.ts
git commit -m "feat: add rounds loading with envelope selection and raw-webcam fallback"
```

---

### Task 4: CSS Theme — Analog Dispatch Desk

Replace the existing `globals.css` with the full analog dispatch desk theme. This sets up CSS variables, typography, and reusable classes used by all components.

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Rewrite globals.css with the dispatch desk theme**

Replace the full contents of `app/globals.css` with:

```css
:root {
  color-scheme: dark;

  /* Dispatch desk palette */
  --desk: #1a1208;
  --desk-light: #2a1f14;
  --manila: #c4a862;
  --manila-dark: #6b5530;
  --text-primary: #e8d5b0;
  --text-secondary: #c4a97d;
  --text-muted: #8a7454;
  --accent: #d4a24e;
  --danger: #8b0000;
  --success: #4a7a4a;
  --border: #3d2e1a;

  /* Typography */
  --font-mono: 'Courier New', 'Courier', monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
}

html, body {
  min-height: 100vh;
  background: var(--desk);
  color: var(--text-primary);
  font-family: var(--font-mono);
}

/* ── Stencil headings ── */
.stencil {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}

/* ── Paper surface ── */
.paper {
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 28px,
      rgba(139, 119, 79, 0.06) 28px,
      rgba(139, 119, 79, 0.06) 29px
    ),
    linear-gradient(180deg, #d4c9a8 0%, #c9bc97 100%);
  color: #2a1f14;
  border-radius: 4px;
  box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.4);
}

/* ── Manila envelope ── */
.manila {
  background: var(--manila);
  border-radius: 4px;
  padding: 3px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.5);
}

/* ── Rubber stamp ── */
.stamp {
  display: inline-block;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 2px solid currentColor;
  padding: 2px 8px;
  transform: rotate(-2deg);
  opacity: 0.75;
  font-weight: 700;
}

.stamp-danger {
  color: var(--danger);
  border-color: var(--danger);
}

.stamp-success {
  color: var(--success);
  border-color: var(--success);
}

/* ── Action buttons ── */
.btn {
  font-family: var(--font-mono);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 10px 24px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: var(--danger);
  color: var(--text-primary);
  border-color: #a04040;
}

.btn-primary:hover {
  background: #a01010;
}

.btn-secondary {
  background: var(--desk-light);
  color: var(--text-secondary);
  border-color: var(--border);
}

.btn-secondary:hover {
  background: #352a1c;
}

.btn-duration {
  background: var(--desk-light);
  color: var(--text-secondary);
  border: 2px solid var(--border);
  padding: 12px 20px;
  min-width: 80px;
  text-align: center;
}

.btn-duration[data-selected="true"] {
  background: var(--accent);
  color: var(--desk);
  border-color: var(--accent);
  font-weight: 700;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* ── HUD bar ── */
.hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--desk);
  border-bottom: 2px solid var(--border);
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.hud-value {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.hud-timer-urgent {
  color: var(--danger);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ── Map container ── */
.map-container {
  width: 100%;
  height: 100%;
}

.map-container .leaflet-tile-pane {
  filter: sepia(0.3) hue-rotate(10deg) brightness(0.9);
}

/* ── Feedback overlay ── */
.feedback-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  animation: feedbackFade 1.8s ease-out forwards;
}

.feedback-correct {
  background: rgba(74, 122, 74, 0.25);
  color: #8fce8f;
}

.feedback-wrong {
  background: rgba(139, 0, 0, 0.25);
  color: #e09090;
}

@keyframes feedbackFade {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}
```

- [ ] **Step 2: Verify the app still compiles**

Run: `npx next build` (or `npx tsc --noEmit` for a quick check)
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: replace CSS theme with analog dispatch desk aesthetic"
```

---

### Task 5: HUD Component

The top bar showing round progress, countdown timer, and verified count.

**Files:**
- Create: `app/components/HUD.tsx`

- [ ] **Step 1: Create the HUD component**

Create `app/components/HUD.tsx`:

```tsx
"use client";

export type HUDProps = {
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  correct: number;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HUD({ currentRound, totalRounds, timeRemaining, correct }: HUDProps) {
  const urgent = timeRemaining <= 30;

  return (
    <div className="hud">
      <span>
        PACKET <span className="hud-value">{currentRound}</span> OF {totalRounds}
      </span>
      <span>
        TIME:{" "}
        <span className={`hud-value ${urgent ? "hud-timer-urgent" : ""}`}>
          {formatTime(timeRemaining)}
        </span>
      </span>
      <span>
        VERIFIED: <span className="hud-value">{correct}</span>
      </span>
      <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 11 }}>
        Verify all intersections before shift handoff
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/HUD.tsx
git commit -m "feat: add HUD component for shift screen top bar"
```

---

### Task 6: PacketPhoto Component

Manila-envelope styled wrapper for the traffic camera image.

**Files:**
- Create: `app/components/PacketPhoto.tsx`

- [ ] **Step 1: Create the PacketPhoto component**

Create `app/components/PacketPhoto.tsx`:

```tsx
"use client";

export type PacketPhotoProps = {
  imageSrc: string;
  packetId: string;
};

export default function PacketPhoto({ imageSrc, packetId }: PacketPhotoProps) {
  // Derive a short anonymous ID from the round id: "PKT-" + last 4 digits of hash
  const shortId = packetId.replace(/\D/g, "").slice(-4).padStart(4, "0");

  return (
    <div className="manila" style={{ maxWidth: 380, width: "100%" }}>
      {/* Envelope header */}
      <div
        style={{
          padding: "8px 10px 4px",
          fontSize: 11,
          color: "#3d2e1a",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 700 }}>PKT-{shortId}</span>
        <span style={{ color: "var(--manila-dark)" }}>PRIORITY</span>
      </div>

      {/* Photo frame */}
      <div
        style={{
          background: "var(--desk)",
          margin: "0 6px 6px",
          padding: 8,
          borderRadius: 2,
        }}
      >
        <div style={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
          <img
            src={imageSrc}
            alt="Traffic camera photo"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              filter: "sepia(0.15) contrast(1.05)",
              borderRadius: 2,
            }}
          />
          {/* Paper grain overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(194,168,98,0.03) 2px, rgba(194,168,98,0.03) 4px)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Stamp */}
      <div style={{ padding: "4px 10px 8px", textAlign: "right" }}>
        <span className="stamp stamp-danger" style={{ fontSize: 10 }}>
          UNVERIFIED
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/PacketPhoto.tsx
git commit -m "feat: add PacketPhoto component with manila envelope styling"
```

---

### Task 7: WorldMap Component

Leaflet map with themed dark tiles, candidate markers, selection logic, and confirm button. Must be dynamically imported (no SSR) because Leaflet requires `window`.

**Files:**
- Create: `app/components/WorldMap.tsx`
- Create: `app/components/WorldMapLoader.tsx`

- [ ] **Step 1: Create the WorldMap component**

Create `app/components/WorldMap.tsx`:

```tsx
"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Round, RoundFeedback } from "../../lib/game/types";

export type WorldMapProps = {
  rounds: Round[];
  roundResults: RoundFeedback[];
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
};

/** Determine marker state for a given round */
function markerState(
  round: Round,
  roundResults: RoundFeedback[],
): "correct" | "incorrect" | "unguessed" {
  const result = roundResults.find((r) => r.correctId === round.id);
  if (!result) return "unguessed";
  return result.correct ? "correct" : "incorrect";
}

const MARKER_STYLES = {
  unguessed: { color: "#c4a862", fillColor: "#6b5530", fillOpacity: 0.6, radius: 6, weight: 1.5 },
  selected: { color: "#e8d5b0", fillColor: "#d4a24e", fillOpacity: 1, radius: 10, weight: 2 },
  correct: { color: "#6aae6a", fillColor: "#4a7a4a", fillOpacity: 0.7, radius: 6, weight: 1.5 },
  incorrect: { color: "#c06060", fillColor: "#8b0000", fillOpacity: 0.7, radius: 6, weight: 1.5 },
} as const;

function FitBounds({ rounds }: { rounds: Round[] }) {
  const map = useMap();
  const bounds = rounds.map((r) => [r.lat, r.lng] as [number, number]);
  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
  }
  return null;
}

export default function WorldMap({
  rounds,
  roundResults,
  selectedId,
  onSelectMarker,
}: WorldMapProps) {
  return (
    <div className="map-container">
      <MapContainer
        center={[30, 10]}
        zoom={2}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <FitBounds rounds={rounds} />

        {rounds.map((round) => {
          const state = markerState(round, roundResults);
          const isSelected = selectedId === round.id;
          const clickable = state === "unguessed";
          const style = isSelected
            ? MARKER_STYLES.selected
            : MARKER_STYLES[state];

          return (
            <CircleMarker
              key={round.id}
              center={[round.lat, round.lng]}
              {...style}
              eventHandlers={
                clickable
                  ? { click: () => onSelectMarker(round.id) }
                  : undefined
              }
              interactive={clickable || isSelected}
            >
              {isSelected && (
                <Tooltip permanent direction="top" offset={[0, -12]}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {round.city}, {round.country}
                  </span>
                </Tooltip>
              )}
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
```

- [ ] **Step 2: Create the dynamic loader**

Create `app/components/WorldMapLoader.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import type { WorldMapProps } from "./WorldMap";

const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--desk)",
        color: "var(--text-muted)",
        fontSize: 13,
      }}
    >
      Loading map...
    </div>
  ),
});

export default function WorldMapLoader(props: WorldMapProps) {
  return <WorldMap {...props} />;
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/components/WorldMap.tsx app/components/WorldMapLoader.tsx
git commit -m "feat: add themed WorldMap component with candidate markers and dynamic loading"
```

---

### Task 8: FeedbackOverlay Component

Brief correct/wrong flash that appears after each guess and auto-dismisses.

**Files:**
- Create: `app/components/FeedbackOverlay.tsx`

- [ ] **Step 1: Create the FeedbackOverlay component**

Create `app/components/FeedbackOverlay.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import type { RoundFeedback, Round } from "../../lib/game/types";

export type FeedbackOverlayProps = {
  feedback: RoundFeedback;
  rounds: Round[];
  onDismiss: () => void;
};

export default function FeedbackOverlay({ feedback, rounds, onDismiss }: FeedbackOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 1800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const correctRound = rounds.find((r) => r.id === feedback.correctId);
  const correctLabel = correctRound
    ? `${correctRound.city}, ${correctRound.country}`
    : feedback.correctId;

  return (
    <div
      className={`feedback-overlay ${feedback.correct ? "feedback-correct" : "feedback-wrong"}`}
    >
      <div style={{ textAlign: "center" }}>
        {feedback.correct ? (
          <div>VERIFIED</div>
        ) : (
          <>
            <div>INCORRECT</div>
            <div style={{ fontSize: 14, marginTop: 8, opacity: 0.8 }}>
              Target was: {correctLabel}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/FeedbackOverlay.tsx
git commit -m "feat: add FeedbackOverlay component for post-guess result flash"
```

---

### Task 9: BriefingScreen Component

The opening screen: fiction framing, rules, duration selector, and start button.

**Files:**
- Create: `app/components/BriefingScreen.tsx`

- [ ] **Step 1: Create the BriefingScreen component**

Create `app/components/BriefingScreen.tsx`:

```tsx
"use client";

import { useState } from "react";

export type BriefingScreenProps = {
  onStartShift: (durationSeconds: number) => void;
};

const DURATIONS = [
  { label: "90 SEC", value: 90 },
  { label: "3 MIN", value: 180 },
  { label: "5 MIN", value: 300 },
];

export default function BriefingScreen({ onStartShift }: BriefingScreenProps) {
  const [selected, setSelected] = useState(180);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: `radial-gradient(ellipse at center, var(--desk-light), var(--desk))`,
      }}
    >
      <div className="paper" style={{ maxWidth: 560, width: "100%", padding: "32px 36px" }}>
        {/* Title */}
        <h1
          className="stencil"
          style={{
            fontSize: "clamp(1.4rem, 4vw, 2rem)",
            textAlign: "center",
            marginBottom: 20,
            color: "#2a1f14",
          }}
        >
          Global Emergency Shift
        </h1>

        {/* Dispatch memo */}
        <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
          A coordinated cyberattack has corrupted GPS-linked camera metadata worldwide.
          Surviving physical maintenance packets have been routed to your desk.
          Verify as many camera locations as possible before shift handoff.
        </p>

        {/* Rules */}
        <div
          style={{
            background: "rgba(42, 31, 20, 0.08)",
            border: "1px solid rgba(42, 31, 20, 0.2)",
            borderRadius: 3,
            padding: "12px 16px",
            fontSize: 12,
            lineHeight: 1.8,
            marginBottom: 24,
          }}
        >
          <div className="stencil" style={{ fontSize: 11, marginBottom: 6, color: "#5a4a32" }}>
            Field Instructions
          </div>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>An envelope of 10 camera photos has arrived at your desk</li>
            <li>Select the matching location on the map for each photo</li>
            <li>Work quickly — your shift timer is running</li>
            <li>You will be graded on how many you verify correctly out of 10</li>
          </ul>
        </div>

        {/* Duration selector */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            className="stencil"
            style={{ fontSize: 11, marginBottom: 10, color: "#5a4a32" }}
          >
            Shift Duration
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                className="btn btn-duration"
                data-selected={selected === d.value}
                onClick={() => setSelected(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <div style={{ textAlign: "center" }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 16, padding: "14px 40px" }}
            onClick={() => onStartShift(selected)}
          >
            Begin Shift
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/BriefingScreen.tsx
git commit -m "feat: add BriefingScreen with fiction framing, rules, and duration selector"
```

---

### Task 10: ShiftScreen Component

Composes HUD, PacketPhoto, WorldMap, and FeedbackOverlay into the main gameplay screen.

**Files:**
- Create: `app/components/ShiftScreen.tsx`

- [ ] **Step 1: Create the ShiftScreen component**

Create `app/components/ShiftScreen.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import type { GameState, GameAction } from "../../lib/game/types";
import HUD from "./HUD";
import PacketPhoto from "./PacketPhoto";
import WorldMapLoader from "./WorldMapLoader";
import FeedbackOverlay from "./FeedbackOverlay";

export type ShiftScreenProps = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

export default function ShiftScreen({ state, dispatch }: ShiftScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentRound = state.rounds[state.currentRoundIndex];

  const handleConfirm = useCallback(() => {
    if (!selectedId) return;
    dispatch({ type: "SUBMIT_GUESS", chosenId: selectedId });
    setSelectedId(null);
  }, [selectedId, dispatch]);

  const handleDismiss = useCallback(() => {
    dispatch({ type: "DISMISS_FEEDBACK" });
  }, [dispatch]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* HUD */}
      <HUD
        currentRound={state.currentRoundIndex + 1}
        totalRounds={state.rounds.length}
        timeRemaining={state.timeRemaining}
        correct={state.correct}
      />

      {/* Two-panel layout */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Left panel: photo */}
        <div
          style={{
            flex: "0 0 42%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "var(--desk-light)",
          }}
        >
          {currentRound && (
            <PacketPhoto imageSrc={currentRound.image} packetId={currentRound.id} />
          )}
        </div>

        {/* Right panel: map + confirm */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderLeft: "2px solid var(--border)",
            position: "relative",
          }}
        >
          {/* Map */}
          <div style={{ flex: 1, position: "relative" }}>
            <WorldMapLoader
              rounds={state.rounds}
              roundResults={state.roundResults}
              selectedId={selectedId}
              onSelectMarker={setSelectedId}
            />

            {/* Feedback overlay */}
            {state.feedback && (
              <FeedbackOverlay
                feedback={state.feedback}
                rounds={state.rounds}
                onDismiss={handleDismiss}
              />
            )}
          </div>

          {/* Confirm bar */}
          <div
            style={{
              padding: "10px 16px",
              background: "var(--desk)",
              borderTop: "2px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
              {selectedId
                ? <>Selected: <strong style={{ color: "var(--text-primary)" }}>
                    {state.rounds.find((r) => r.id === selectedId)?.city},{" "}
                    {state.rounds.find((r) => r.id === selectedId)?.country}
                  </strong></>
                : "Click a marker to select a location"}
            </span>
            <button
              className="btn btn-primary"
              disabled={!selectedId || state.feedback !== null}
              onClick={handleConfirm}
            >
              Log Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/ShiftScreen.tsx
git commit -m "feat: add ShiftScreen composing HUD, PacketPhoto, WorldMap, and FeedbackOverlay"
```

---

### Task 11: DebriefScreen Component

End-of-shift results screen with score, stats, flavor text, and replay button.

**Files:**
- Create: `app/components/DebriefScreen.tsx`

- [ ] **Step 1: Create the DebriefScreen component**

Create `app/components/DebriefScreen.tsx`:

```tsx
"use client";

import type { ShiftResult } from "../../lib/game/types";

export type DebriefScreenProps = {
  result: ShiftResult;
  onPlayAgain: () => void;
};

function flavorText(correct: number, total: number): string {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= 0.9) {
    return "Outstanding work. Emergency coordinators now have a viable routing backbone for 3 continental zones.";
  }
  if (ratio >= 0.4) {
    return "Shift logged. Your verifications have been forwarded to the regional routing desk.";
  }
  return "Partial coverage filed. The next shift will continue where you left off.";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function DebriefScreen({ result, onPlayAgain }: DebriefScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: `radial-gradient(ellipse at center, var(--desk-light), var(--desk))`,
      }}
    >
      <div className="paper" style={{ maxWidth: 480, width: "100%", padding: "32px 36px" }}>
        {/* Header */}
        <h1
          className="stencil"
          style={{
            fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
            textAlign: "center",
            marginBottom: 24,
            color: "#2a1f14",
          }}
        >
          Shift Debrief
        </h1>

        {/* Score */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#2a1f14" }}>
            {result.correct} <span style={{ fontSize: 24, color: "#5a4a32" }}>/ 10</span>
          </div>
          <div
            className="stencil"
            style={{ fontSize: 11, color: "#5a4a32", marginTop: 4 }}
          >
            Locations Verified
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 24,
            fontSize: 12,
            color: "#5a4a32",
          }}
        >
          <div>
            <div className="stencil" style={{ fontSize: 10, marginBottom: 2 }}>
              Rounds Attempted
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2a1f14" }}>
              {result.total}
            </div>
          </div>
          <div>
            <div className="stencil" style={{ fontSize: 10, marginBottom: 2 }}>
              Time Used
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2a1f14" }}>
              {formatTime(result.timeUsed)}
            </div>
          </div>
          <div>
            <div className="stencil" style={{ fontSize: 10, marginBottom: 2 }}>
              Shift Duration
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2a1f14" }}>
              {formatTime(result.durationSeconds)}
            </div>
          </div>
          <div>
            <div className="stencil" style={{ fontSize: 10, marginBottom: 2 }}>
              Accuracy
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2a1f14" }}>
              {result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Flavor text */}
        <p
          style={{
            fontSize: 12,
            fontStyle: "italic",
            lineHeight: 1.7,
            marginBottom: 24,
            color: "#5a4a32",
          }}
        >
          {flavorText(result.correct, result.total)}
        </p>

        {/* Replay button */}
        <div style={{ textAlign: "center" }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 16, padding: "14px 40px" }}
            onClick={onPlayAgain}
          >
            New Shift
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/components/DebriefScreen.tsx
git commit -m "feat: add DebriefScreen with score, stats, flavor text, and replay"
```

---

### Task 12: Page Orchestrator

Wire everything together in `app/page.tsx` — the state machine, timer interval, round loading, and screen switching.

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx as the game orchestrator**

Replace the full contents of `app/page.tsx` with:

```tsx
"use client";

import { useReducer, useEffect, useCallback, useState } from "react";
import { gameReducer, initialGameState, buildShiftResult } from "../lib/game/engine";
import { loadRounds, selectEnvelope } from "../lib/game/rounds";
import type { Round } from "../lib/game/types";
import BriefingScreen from "./components/BriefingScreen";
import ShiftScreen from "./components/ShiftScreen";
import DebriefScreen from "./components/DebriefScreen";

export default function HomePage() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [allRounds, setAllRounds] = useState<Round[]>([]);

  // Load rounds once on mount
  useEffect(() => {
    loadRounds().then(setAllRounds);
  }, []);

  // Timer: tick every second while in shift phase
  useEffect(() => {
    if (state.phase !== "shift") return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  const handleStartShift = useCallback(
    (durationSeconds: number) => {
      const envelope = selectEnvelope(allRounds, 10);
      dispatch({ type: "START_SHIFT", durationSeconds, rounds: envelope });
    },
    [allRounds],
  );

  const handlePlayAgain = useCallback(() => {
    dispatch({ type: "PLAY_AGAIN" });
  }, []);

  // Loading state while rounds are fetched
  if (allRounds.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Loading dispatch data...
      </div>
    );
  }

  switch (state.phase) {
    case "briefing":
      return <BriefingScreen onStartShift={handleStartShift} />;
    case "shift":
      return <ShiftScreen state={state} dispatch={dispatch} />;
    case "debrief":
      return <DebriefScreen result={buildShiftResult(state)} onPlayAgain={handlePlayAgain} />;
  }
}
```

- [ ] **Step 2: Verify the full app compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: all tests pass (engine + rounds + existing score tests)

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire up page orchestrator with state machine, timer, and screen routing"
```

---

### Task 13: Smoke Test

Start the dev server and manually verify the full gameplay loop works end-to-end.

**Files:** (none — this is a manual verification task)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server starts on localhost:3000

- [ ] **Step 2: Verify Briefing Screen**

Open http://localhost:3000 in a browser. Check:
- Title "GLOBAL EMERGENCY SHIFT" is visible
- Dispatch memo text is present
- Rules list is readable
- Duration buttons (90 SEC, 3 MIN, 5 MIN) render; clicking one highlights it
- "BEGIN SHIFT" button is present

- [ ] **Step 3: Verify Shift Screen**

Click "BEGIN SHIFT". Check:
- HUD bar shows "PACKET 1 OF 10", timer counting down, "VERIFIED: 0"
- Left panel shows a traffic camera photo in a manila envelope wrapper
- Right panel shows a Leaflet map with dark themed tiles
- All candidate markers are visible on the map as amber dots
- Clicking a marker highlights it and shows city/country label
- "LOG LOCATION" button activates when a marker is selected
- Clicking "LOG LOCATION" triggers feedback overlay (VERIFIED or INCORRECT)
- After feedback, next packet loads automatically

- [ ] **Step 4: Verify Debrief Screen**

Either complete all 10 rounds or let the timer run out. Check:
- Score shows X/10
- Stats (rounds attempted, time used, shift duration, accuracy) are correct
- Flavor text matches the score tier
- "NEW SHIFT" button returns to briefing

- [ ] **Step 5: Fix any issues found**

Address any visual or functional issues. Re-run tests after any fixes.

- [ ] **Step 6: Final commit if any fixes were made**

```bash
git add -A
git commit -m "fix: address issues found during smoke test"
```

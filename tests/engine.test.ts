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
        mode: "global",
        durationSeconds: 180,
        rounds: fakeRounds,
      });
      expect(state.phase).toBe("shift");
      expect(state.rounds).toEqual(fakeRounds);
      expect(state.durationSeconds).toBe(180);
      expect(state.timeRemaining).toBe(180);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.correct).toBe(0);
      expect(state.mode).toBe("global");
      expect(state.feedback).toBeNull();
      expect(state.roundResults).toEqual([]);
    });
  });

  describe("SUBMIT_GUESS", () => {
    it("sets feedback with correct=true when the guess matches the current round", () => {
      const shiftState: GameState = {
        phase: "shift",
        mode: "global",
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
        mode: "global",
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

    it("keeps Austin in shift after dismissing feedback with time remaining", () => {
      const state: GameState = {
        phase: "shift",
        mode: "austin",
        rounds: [fakeRounds[0]],
        currentRoundIndex: 0,
        correct: 1,
        timeRemaining: 120,
        durationSeconds: 180,
        feedback: { correct: true, chosenId: "london-1", correctId: "london-1" },
        roundResults: [{ correct: true, chosenId: "london-1", correctId: "london-1" }],
      };

      const next = gameReducer(state, { type: "DISMISS_FEEDBACK" });

      expect(next.phase).toBe("shift");
      expect(next.feedback).toBeNull();
      expect(next.currentRoundIndex).toBe(0);
      expect(next.mode).toBe("austin");
    });

    it("replaces Austin rounds without resetting score or time", () => {
      const state: GameState = {
        phase: "shift",
        mode: "austin",
        rounds: [fakeRounds[0]],
        currentRoundIndex: 0,
        correct: 1,
        timeRemaining: 117,
        durationSeconds: 180,
        feedback: null,
        roundResults: [{ correct: true, chosenId: "london-1", correctId: "london-1" }],
      };

      const nextRounds: Round[] = [fakeRounds[1]];
      const next = gameReducer(state, { type: "REPLACE_ROUNDS", rounds: nextRounds });

      expect(next.phase).toBe("shift");
      expect(next.rounds).toEqual(nextRounds);
      expect(next.currentRoundIndex).toBe(0);
      expect(next.correct).toBe(1);
      expect(next.timeRemaining).toBe(117);
      expect(next.durationSeconds).toBe(180);
      expect(next.mode).toBe("austin");
      expect(next.feedback).toBeNull();
    });
    it("advances to the next round", () => {
      const state: GameState = {
        phase: "shift",
        mode: "global",
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
        mode: "global",
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
        mode: "global",
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
        mode: "global",
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
        mode: "global",
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

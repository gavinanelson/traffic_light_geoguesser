import type { GameState, GameAction, ShiftResult } from "./types";

export const initialGameState: GameState = {
  phase: "briefing",
  mode: "global",
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
    mode: state.mode,
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
        mode: action.mode,
        rounds: action.rounds,
        durationSeconds: action.durationSeconds,
        timeRemaining: action.durationSeconds,
      };

    case "REPLACE_ROUNDS": {
      if (state.phase !== "shift" || state.timeRemaining <= 0) return state;
      return {
        ...state,
        rounds: action.rounds,
        currentRoundIndex: 0,
        feedback: null,
        phase: "shift",
      };
    }

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
      if (state.mode === "austin") {
        return {
          ...state,
          feedback: null,
          currentRoundIndex: 0,
          phase: state.timeRemaining <= 0 ? "debrief" : "shift",
        };
      }
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

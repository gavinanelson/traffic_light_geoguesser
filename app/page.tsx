"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import { gameReducer, initialGameState, buildShiftResult } from "../lib/game/engine";
import { loadRounds, selectEnvelope } from "../lib/game/rounds";
import BriefingScreen from "./components/BriefingScreen";
import ShiftScreen from "./components/ShiftScreen";
import DebriefScreen from "./components/DebriefScreen";

const allRounds = loadRounds();

export default function HomePage() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const timerStarted = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear timer when leaving shift phase
  useEffect(() => {
    if (state.phase !== "shift") {
      timerStarted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state.phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleTimerStart = useCallback(() => {
    if (timerStarted.current) return;
    timerStarted.current = true;
    intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
  }, []);

  const handleStartShift = useCallback(
    (durationSeconds: number) => {
      const envelope = selectEnvelope(allRounds, 10);
      dispatch({ type: "START_SHIFT", durationSeconds, rounds: envelope });
    },
    [],
  );

  const handlePlayAgain = useCallback(() => {
    dispatch({ type: "PLAY_AGAIN" });
  }, []);

  switch (state.phase) {
    case "briefing":
      return <BriefingScreen onStartShift={handleStartShift} />;
    case "shift":
      return (
        <ShiftScreen
          state={state}
          dispatch={dispatch}
          onTimerStart={handleTimerStart}
        />
      );
    case "debrief":
      return <DebriefScreen result={buildShiftResult(state)} onPlayAgain={handlePlayAgain} />;
  }
}

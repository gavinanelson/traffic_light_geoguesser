"use client";

import { useReducer, useEffect, useCallback, useRef, useState } from "react";
import { gameReducer, initialGameState, buildShiftResult } from "../lib/game/engine";
import { requestEnvelope } from "../lib/game/envelope-client";
import type { GameMode } from "../lib/game/types";
import BriefingScreen from "./components/BriefingScreen";
import ShiftScreen from "./components/ShiftScreen";
import DebriefScreen from "./components/DebriefScreen";

export default function HomePage() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const timerStarted = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.phase !== "shift") {
      timerStarted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state.phase]);

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

  const handleStartShift = useCallback(async (mode: GameMode, durationSeconds: number) => {
    setIsStarting(true);
    setLoadError(null);

    try {
      const envelope = await requestEnvelope(fetch, mode, 10);
      dispatch({ type: "START_SHIFT", durationSeconds, rounds: envelope });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to assign envelope");
    } finally {
      setIsStarting(false);
    }
  }, []);

  const handlePlayAgain = useCallback(() => {
    dispatch({ type: "PLAY_AGAIN" });
    setLoadError(null);
  }, []);

  switch (state.phase) {
    case "briefing":
      return (
        <BriefingScreen
          onStartShift={handleStartShift}
          isStarting={isStarting}
          errorMessage={loadError}
        />
      );
    case "shift":
      return <ShiftScreen state={state} dispatch={dispatch} onTimerStart={handleTimerStart} />;
    case "debrief":
      return <DebriefScreen result={buildShiftResult(state)} onPlayAgain={handlePlayAgain} />;
  }
}

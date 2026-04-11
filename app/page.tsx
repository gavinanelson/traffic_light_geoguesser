"use client";

import { useReducer, useEffect, useCallback, useState } from "react";
import { gameReducer, initialGameState, buildShiftResult } from "../lib/game/engine";
import { requestEnvelope } from "../lib/game/envelope-client";
import BriefingScreen from "./components/BriefingScreen";
import ShiftScreen from "./components/ShiftScreen";
import DebriefScreen from "./components/DebriefScreen";

export default function HomePage() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (state.phase !== "shift") return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  const handleStartShift = useCallback(async (mode: "global" | "austin", durationSeconds: number) => {
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
      return <ShiftScreen state={state} dispatch={dispatch} />;
    case "debrief":
      return <DebriefScreen result={buildShiftResult(state)} onPlayAgain={handlePlayAgain} />;
  }
}

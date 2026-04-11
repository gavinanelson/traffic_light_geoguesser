"use client";

import { useReducer, useEffect, useCallback } from "react";
import { gameReducer, initialGameState, buildShiftResult } from "../lib/game/engine";
import { loadRounds, selectEnvelope } from "../lib/game/rounds";
import BriefingScreen from "./components/BriefingScreen";
import ShiftScreen from "./components/ShiftScreen";
import DebriefScreen from "./components/DebriefScreen";

const allRounds = loadRounds();

export default function HomePage() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

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
    [],
  );

  const handlePlayAgain = useCallback(() => {
    dispatch({ type: "PLAY_AGAIN" });
  }, []);

  switch (state.phase) {
    case "briefing":
      return <BriefingScreen onStartShift={handleStartShift} />;
    case "shift":
      return <ShiftScreen state={state} dispatch={dispatch} />;
    case "debrief":
      return <DebriefScreen result={buildShiftResult(state)} onPlayAgain={handlePlayAgain} />;
  }
}

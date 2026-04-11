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

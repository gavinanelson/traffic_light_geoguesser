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
  const austinFetchCursorRef = useRef(0);
  const austinFetchPendingRef = useRef(false);

  useEffect(() => {
    if (state.phase !== "shift") {
      timerStarted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      austinFetchCursorRef.current = 0;
      austinFetchPendingRef.current = false;
    }
  }, [state.phase]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (state.phase !== "shift" || state.mode !== "austin") {
      return;
    }

    if (state.feedback !== null || state.timeRemaining <= 0) {
      return;
    }

    const completed = state.roundResults.length;
    if (completed === 0 || completed <= austinFetchCursorRef.current || austinFetchPendingRef.current) {
      return;
    }

    austinFetchPendingRef.current = true;
    austinFetchCursorRef.current = completed;

    void (async () => {
      try {
        const envelope = await requestEnvelope(fetch, "austin", 1);
        setLoadError(null);
        dispatch({ type: "REPLACE_ROUNDS", rounds: envelope });
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Failed to assign envelope");
      } finally {
        austinFetchPendingRef.current = false;
      }
    })();
  }, [state.feedback, state.mode, state.phase, state.roundResults.length, state.timeRemaining]);

  const handleTimerStart = useCallback(() => {
    if (timerStarted.current) return;
    timerStarted.current = true;
    intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
  }, []);

  const handleStartShift = useCallback(async (mode: GameMode, durationSeconds: number) => {
    setIsStarting(true);
    setLoadError(null);

    try {
      const count = mode === "austin" ? 1 : 10;
      const envelope = await requestEnvelope(fetch, mode, count);
      dispatch({ type: "START_SHIFT", mode, durationSeconds, rounds: envelope });
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

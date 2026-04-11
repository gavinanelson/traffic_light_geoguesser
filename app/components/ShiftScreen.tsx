"use client";

import { useState, useCallback, useRef } from "react";
import type { GameState, GameAction } from "../../lib/game/types";
import HUD from "./HUD";
import PacketPhoto from "./PacketPhoto";
import WorldMapLoader from "./WorldMapLoader";
import FeedbackOverlay from "./FeedbackOverlay";
import EnvelopeAnimation from "./EnvelopeAnimation";

export type ShiftScreenProps = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onTimerStart?: () => void;
};

export default function ShiftScreen({ state, dispatch, onTimerStart }: ShiftScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Track which photo is sliding off (by key) so we can show next underneath
  const [slidingOffKey, setSlidingOffKey] = useState<string | null>(null);
  // The photo index we're visually showing (advances immediately on guess)
  const [visualIndex, setVisualIndex] = useState(0);
  const nextIndexRef = useRef(0);

  const currentRound = state.rounds[visualIndex];
  const remainingCount = state.rounds.length - visualIndex;

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    onTimerStart?.();
  }, [onTimerStart]);

  const handleConfirm = useCallback(() => {
    if (!selectedId) return;

    const currentKey = state.rounds[visualIndex]?.id;
    setSlidingOffKey(currentKey);

    // Dispatch the guess
    dispatch({ type: "SUBMIT_GUESS", chosenId: selectedId });
    setSelectedId(null);

    // Advance visual to next photo immediately
    const next = visualIndex + 1;
    nextIndexRef.current = next;

    // After slide-off animation completes (350ms), clear the sliding state
    // and show the next photo
    setTimeout(() => {
      setSlidingOffKey(null);
      setVisualIndex(nextIndexRef.current);
    }, 350);
  }, [selectedId, dispatch, visualIndex, state.rounds]);

  const handleDismiss = useCallback(() => {
    dispatch({ type: "DISMISS_FEEDBACK" });
  }, [dispatch]);

  const deskBackground = `
    repeating-linear-gradient(
      87deg,
      transparent,
      transparent 3px,
      rgba(60, 42, 20, 0.08) 3px,
      rgba(60, 42, 20, 0.08) 6px
    ),
    repeating-linear-gradient(
      2deg,
      transparent,
      transparent 40px,
      rgba(90, 65, 30, 0.06) 40px,
      rgba(90, 65, 30, 0.06) 41px
    ),
    linear-gradient(
      90deg,
      #231a0e 0%,
      #2e2114 15%,
      #342618 40%,
      #2e2114 60%,
      #291d10 85%,
      #231a0e 100%
    )
  `;

  // The next photo that sits underneath during slide-off
  const nextRound = visualIndex + 1 < state.rounds.length
    ? state.rounds[visualIndex + 1]
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <HUD
        currentRound={visualIndex + 1}
        totalRounds={state.rounds.length}
        timeRemaining={state.timeRemaining}
        correct={state.correct}
      />

      <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        {/* Left panel: photo on desk */}
        <div
          style={{
            flex: "0 0 44%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: deskBackground,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {!showIntro && currentRound && (
            <div style={{ position: "relative", maxWidth: 520, width: "100%" }}>
              {/* Next photo underneath (visible during slide-off) */}
              {slidingOffKey && nextRound && (
                <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                  <PacketPhoto
                    imageSrc={nextRound.image}
                    packetId={nextRound.id}
                    remainingCount={remainingCount - 1}
                    slideOff={false}
                  />
                </div>
              )}

              {/* Current photo (slides off on guess) */}
              <div style={{ position: "relative", zIndex: 2 }}>
                <PacketPhoto
                  key={currentRound.id}
                  imageSrc={currentRound.image}
                  packetId={currentRound.id}
                  remainingCount={remainingCount}
                  slideOff={slidingOffKey === currentRound.id}
                />
              </div>
            </div>
          )}

          {/* Envelope animation overlay */}
          {showIntro && <EnvelopeAnimation onComplete={handleIntroComplete} />}
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
          <div style={{ flex: 1, position: "relative" }}>
            <WorldMapLoader
              rounds={state.rounds}
              roundResults={state.roundResults}
              selectedId={selectedId}
              onSelectMarker={setSelectedId}
            />

            {state.feedback && (
              <FeedbackOverlay
                feedback={state.feedback}
                rounds={state.rounds}
                onDismiss={handleDismiss}
              />
            )}
          </div>

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
              disabled={!selectedId || slidingOffKey !== null || showIntro}
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

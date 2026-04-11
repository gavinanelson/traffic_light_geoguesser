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
      <HUD
        currentRound={state.currentRoundIndex + 1}
        totalRounds={state.rounds.length}
        timeRemaining={state.timeRemaining}
        correct={state.correct}
      />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div
          style={{
            flex: "0 0 44%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: `
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
            `,
          }}
        >
          {currentRound && (
            <PacketPhoto imageSrc={currentRound.image} packetId={currentRound.id} />
          )}
        </div>

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

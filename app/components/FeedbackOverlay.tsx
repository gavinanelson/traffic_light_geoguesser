"use client";

import { useEffect } from "react";
import type { RoundFeedback, Round } from "../../lib/game/types";

export type FeedbackOverlayProps = {
  feedback: RoundFeedback;
  rounds: Round[];
  onDismiss: () => void;
};

export default function FeedbackOverlay({ feedback, rounds, onDismiss }: FeedbackOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 1200);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const correctRound = rounds.find((r) => r.id === feedback.correctId);
  const correctLabel = correctRound
    ? `${correctRound.city}, ${correctRound.country}`
    : feedback.correctId;

  return (
    <div
      className={`feedback-overlay ${feedback.correct ? "feedback-correct" : "feedback-wrong"}`}
    >
      <div style={{ textAlign: "center" }}>
        {feedback.correct ? (
          <div>VERIFIED</div>
        ) : (
          <>
            <div>INCORRECT</div>
            <div style={{ fontSize: 14, marginTop: 8, opacity: 0.8 }}>
              Target was: {correctLabel}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

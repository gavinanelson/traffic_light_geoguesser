"use client";

import type { ShiftResult } from "../../lib/game/types";

export type DebriefScreenProps = {
  result: ShiftResult;
  onPlayAgain: () => void;
};

function flavorText(correct: number, total: number): string {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= 0.9) {
    return "Outstanding work. Emergency coordinators now have a viable routing backbone for 3 continental zones.";
  }
  if (ratio >= 0.4) {
    return "Shift logged. Your verifications have been forwarded to the regional routing desk.";
  }
  return "Partial coverage filed. The next shift will continue where you left off.";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function DebriefScreen({ result, onPlayAgain }: DebriefScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: `radial-gradient(ellipse at center, var(--desk-light), var(--desk))`,
      }}
    >
      <div className="paper" style={{ maxWidth: 480, width: "100%", padding: "32px 36px" }}>
        <h1
          className="stencil"
          style={{
            fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
            textAlign: "center",
            marginBottom: 24,
            color: "#2a1f14",
          }}
        >
          Shift Debrief
        </h1>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#2a1f14" }}>
            {result.correct} <span style={{ fontSize: 24, color: "#5a4a32" }}>/ 10</span>
          </div>
          <div
            className="stencil"
            style={{ fontSize: 11, color: "#5a4a32", marginTop: 4 }}
          >
            Locations Verified
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 24,
            fontSize: 12,
            color: "#5a4a32",
          }}
        >
          <div>
            <div className="stencil" style={{ fontSize: 10, marginBottom: 2 }}>
              Rounds Attempted
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2a1f14" }}>
              {result.total}
            </div>
          </div>
          <div>
            <div className="stencil" style={{ fontSize: 10, marginBottom: 2 }}>
              Time Used
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2a1f14" }}>
              {formatTime(result.timeUsed)}
            </div>
          </div>
          <div>
            <div className="stencil" style={{ fontSize: 10, marginBottom: 2 }}>
              Shift Duration
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2a1f14" }}>
              {formatTime(result.durationSeconds)}
            </div>
          </div>
          <div>
            <div className="stencil" style={{ fontSize: 10, marginBottom: 2 }}>
              Accuracy
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2a1f14" }}>
              {result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0}%
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: 12,
            fontStyle: "italic",
            lineHeight: 1.7,
            marginBottom: 24,
            color: "#5a4a32",
          }}
        >
          {flavorText(result.correct, result.total)}
        </p>

        <div style={{ textAlign: "center" }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 16, padding: "14px 40px" }}
            onClick={onPlayAgain}
          >
            New Shift
          </button>
        </div>
      </div>
    </div>
  );
}

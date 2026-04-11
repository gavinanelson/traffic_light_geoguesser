"use client";

export type HUDProps = {
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  correct: number;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HUD({ currentRound, totalRounds, timeRemaining, correct }: HUDProps) {
  const urgent = timeRemaining <= 30;

  return (
    <div className="hud">
      <span>
        PACKET <span className="hud-value">{currentRound}</span> OF {totalRounds}
      </span>
      <span>
        TIME:{" "}
        <span className={`hud-value ${urgent ? "hud-timer-urgent" : ""}`}>
          {formatTime(timeRemaining)}
        </span>
      </span>
      <span>
        VERIFIED: <span className="hud-value">{correct}</span>
      </span>
      <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 11 }}>
        Verify all intersections before shift handoff
      </span>
    </div>
  );
}

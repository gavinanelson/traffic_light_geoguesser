"use client";

import { useState } from "react";
import type { GameMode } from "../../lib/game/types";

export type BriefingScreenProps = {
  onStartShift: (mode: GameMode, durationSeconds: number) => void | Promise<void>;
  isStarting?: boolean;
  errorMessage?: string | null;
};

const MODES: Array<{ label: string; value: GameMode }> = [
  { label: "Global Emergency Shift", value: "global" },
  { label: "Austin Archive Recovery", value: "austin" },
];

const DURATIONS = [
  { label: "90 SEC", value: 90 },
  { label: "3 MIN", value: 180 },
  { label: "5 MIN", value: 300 },
];

export default function BriefingScreen({
  onStartShift,
  isStarting = false,
  errorMessage = null,
}: BriefingScreenProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>("global");
  const [selected, setSelected] = useState(180);

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
      <div className="paper" style={{ maxWidth: 560, width: "100%", padding: "32px 36px" }}>
        <h1
          className="stencil"
          style={{
            fontSize: "clamp(1.4rem, 4vw, 2rem)",
            textAlign: "center",
            marginBottom: 20,
            color: "#2a1f14",
          }}
        >
          Global Emergency Shift
        </h1>

        <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
          A coordinated cyberattack has corrupted GPS-linked camera metadata worldwide.
          Surviving physical maintenance packets have been routed to your desk.
          Verify as many camera locations as possible before shift handoff.
        </p>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="stencil" style={{ fontSize: 11, marginBottom: 10, color: "#5a4a32" }}>
            Game Mode
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {MODES.map((mode) => (
              <button
                key={mode.value}
                className="btn btn-duration"
                data-selected={selectedMode === mode.value}
                onClick={() => setSelectedMode(mode.value)}
                disabled={isStarting}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "rgba(42, 31, 20, 0.08)",
            border: "1px solid rgba(42, 31, 20, 0.2)",
            borderRadius: 3,
            padding: "12px 16px",
            fontSize: 12,
            lineHeight: 1.8,
            marginBottom: 24,
          }}
        >
          <div
            className="stencil"
            style={{ fontSize: 11, marginBottom: 6, color: "#5a4a32" }}
          >
            Field Instructions
          </div>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>A randomized envelope of 10 camera photos will be assigned to your desk</li>
            <li>Select the matching location on the map for each photo</li>
            <li>Work quickly — your shift timer is running</li>
            <li>You will be graded on how many you verify correctly out of 10</li>
          </ul>
        </div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="stencil" style={{ fontSize: 11, marginBottom: 10, color: "#5a4a32" }}>
            Shift Duration
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                className="btn btn-duration"
                data-selected={selected === d.value}
                onClick={() => setSelected(d.value)}
                disabled={isStarting}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <p
            style={{
              margin: "0 0 16px",
              color: "#8b0000",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {errorMessage}
          </p>
        ) : null}

        <div style={{ textAlign: "center" }}>
          <button
            className="btn btn-primary"
            style={{ fontSize: 16, padding: "14px 40px" }}
            onClick={() => void onStartShift(selectedMode, selected)}
            disabled={isStarting}
          >
            {isStarting ? "Assigning Envelope..." : "Begin Shift"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

type EnvelopeAnimationProps = {
  onComplete: () => void;
};

type Phase = "enter" | "open" | "drop" | "done";

export default function EnvelopeAnimation({ onComplete }: EnvelopeAnimationProps) {
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("open"), 800),
      setTimeout(() => setPhase("drop"), 1800),
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 2300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  const isDrop = phase === "drop";
  const isOpen = phase === "open" || isDrop;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 8, 4, 0.85)",
      }}
    >
      {/* Photos rising out — shown during open phase, hidden during drop */}
      {isOpen && !isDrop && (
        <div
          className="photos-rising"
          style={{
            position: "absolute",
            zIndex: 2,
          }}
        >
          <div style={{ position: "relative", width: 200, height: 130 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#3a3020",
                borderRadius: 3,
                transform: "rotate(2deg) translate(4px, 4px)",
                border: "1px solid #5a4a30",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#4a4030",
                borderRadius: 3,
                transform: "rotate(-1deg) translate(2px, 2px)",
                border: "1px solid #5a4a30",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#5a5040",
                borderRadius: 3,
                border: "1px solid #6a5a40",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                10 Photos
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Entire envelope — flap + body as one unit so they drop together */}
      <div
        className={isDrop ? "envelope-dropping" : "envelope-intro"}
        style={{ position: "relative", width: 320, zIndex: 1 }}
      >
        {/* Flap — sits on top of body, opens via rotateX */}
        <div
          style={{
            height: 60,
            perspective: 400,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            className={isOpen ? "envelope-flap-open" : ""}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              background: "linear-gradient(180deg, #b89850 0%, var(--manila) 100%)",
              clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
              transformOrigin: "bottom center",
            }}
          />
        </div>

        {/* Body */}
        <div
          style={{
            background: "var(--manila)",
            height: 180,
            borderRadius: "0 0 6px 6px",
            position: "relative",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                fontWeight: 700,
                color: "#3d2e1a",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              Classified
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "#6b5530",
                marginTop: 4,
              }}
            >
              Emergency Camera Verification
            </div>
            <div
              className="stamp stamp-danger"
              style={{ fontSize: 11, marginTop: 12 }}
            >
              Priority
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

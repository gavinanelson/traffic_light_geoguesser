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
      // Flap starts opening at 0.8s (via CSS delay), finishes ~1.4s
      setTimeout(() => setPhase("open"), 800),
      // Envelope drops away at 1.8s
      setTimeout(() => setPhase("drop"), 1800),
      // Animation complete at 2.3s
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 2300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

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
        perspective: 600,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 320,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Photos that rise out */}
        {phase !== "enter" && phase !== "drop" && (
          <div
            className="photos-rising"
            style={{
              position: "absolute",
              top: -40,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
            }}
          >
            {/* Stack of photo cards */}
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

        {/* Envelope */}
        <div
          className={phase === "drop" ? "envelope-dropping" : "envelope-intro"}
          style={{
            position: "relative",
            width: 320,
            zIndex: 1,
          }}
        >
          {/* Flap */}
          <div
            style={{
              position: "relative",
              height: 60,
              overflow: "visible",
              zIndex: 3,
              perspective: 400,
            }}
          >
            <div
              className={phase === "open" || phase === "drop" ? "envelope-flap-open" : ""}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                background: "linear-gradient(180deg, #b89850 0%, var(--manila) 100%)",
                clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                transformOrigin: "top center",
                zIndex: 3,
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
            {/* Envelope label */}
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
    </div>
  );
}

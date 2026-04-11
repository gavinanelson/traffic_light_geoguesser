"use client";

import { useState, useEffect } from "react";
import type { Round } from "../../lib/game/types";
import PacketPhoto from "./PacketPhoto";

type EnvelopeAnimationProps = {
  firstRound: Round;
  totalRounds: number;
  onComplete: () => void;
};

type Phase = "closed" | "opening" | "sliding" | "done";

export default function EnvelopeAnimation({ firstRound, totalRounds, onComplete }: EnvelopeAnimationProps) {
  const [phase, setPhase] = useState<Phase>("closed");

  useEffect(() => {
    const timers = [
      // Start opening the flap
      setTimeout(() => setPhase("opening"), 600),
      // Envelope slides down off the photos
      setTimeout(() => setPhase("sliding"), 1400),
      // Animation complete
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  const isOpening = phase === "opening" || phase === "sliding";
  const isSliding = phase === "sliding";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Photos underneath — always in place, revealed as envelope slides away */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 520, width: "100%" }}>
        <PacketPhoto
          imageSrc={firstRound.image}
          packetId={firstRound.id}
          remainingCount={totalRounds}
          slideOff={false}
        />
      </div>

      {/* Envelope on top — covers the photos, then slides down */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: isSliding ? "transform 0.7s ease-in, opacity 0.7s ease-in" : "none",
          transform: isSliding ? "translateY(110%)" : "translateY(0)",
          opacity: isSliding ? 0 : 1,
        }}
      >
        <div style={{ position: "relative", width: 340 }}>
          {/* Envelope body */}
          <div
            style={{
              background: "var(--manila)",
              borderRadius: 6,
              height: 260,
              position: "relative",
              boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}
          >
            {/* Label */}
            <div
              style={{
                position: "absolute",
                top: 30,
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
                width: "80%",
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
                  marginTop: 6,
                }}
              >
                Emergency Camera Verification
              </div>
              <div
                className="stamp stamp-danger"
                style={{ fontSize: 11, marginTop: 14 }}
              >
                Priority
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "#6b5530",
                  marginTop: 14,
                }}
              >
                {totalRounds} PHOTOS ENCLOSED
              </div>
            </div>
          </div>

          {/* Flap — triangle at the top, points down when closed, flips up to open */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 80,
              perspective: 600,
              zIndex: 3,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 80,
                background: "linear-gradient(180deg, var(--manila) 0%, #b89850 100%)",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transformOrigin: "top center",
                transition: isOpening ? "transform 0.5s ease-in-out" : "none",
                transform: isOpening ? "rotateX(-180deg)" : "rotateX(0deg)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

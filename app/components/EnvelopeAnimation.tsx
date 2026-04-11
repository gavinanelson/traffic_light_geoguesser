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
      setTimeout(() => setPhase("opening"), 600),
      setTimeout(() => setPhase("sliding"), 1400),
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
        padding: 24,
      }}
    >
      {/* Photos underneath — always in place, hidden by envelope until it slides */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 520, width: "100%" }}>
        <PacketPhoto
          imageSrc={firstRound.image}
          packetId={firstRound.id}
          remainingCount={totalRounds}
          slideOff={false}
          hideStack={true}
        />
      </div>

      {/* Envelope on top — same size as the photo area, fully covers it */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          transition: isSliding ? "transform 0.7s ease-in, opacity 0.7s ease-in" : "none",
          transform: isSliding ? "translateY(110%)" : "translateY(0)",
          opacity: isSliding ? 0 : 1,
        }}
      >
        <div style={{ position: "relative", maxWidth: 520, width: "100%" }}>
          {/* Envelope body — matches the photo container size */}
          <div
            style={{
              background: "var(--manila)",
              borderRadius: 6,
              width: "100%",
              aspectRatio: "4 / 3",
              position: "relative",
              boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            {/* Label */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 24,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 18,
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
                  fontSize: 12,
                  color: "#6b5530",
                  marginTop: 8,
                }}
              >
                Emergency Camera Verification
              </div>
              <div
                className="stamp stamp-danger"
                style={{ fontSize: 13, marginTop: 18 }}
              >
                Priority
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "#6b5530",
                  marginTop: 18,
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
              height: "25%",
              perspective: 600,
              zIndex: 3,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
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

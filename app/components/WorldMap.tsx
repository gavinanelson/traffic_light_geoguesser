"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { GameMode, Round, RoundFeedback } from "../../lib/game/types";
import austinRounds from "../../data/rounds-austin.json";
import rawWebcams from "../../data/raw-webcams.json";

export const AUSTIN_BOUNDS: [[number, number], [number, number]] = [
  [30.08, -98.08],
  [30.55, -97.48],
];

export type WorldMapProps = {
  rounds: Round[];
  roundResults: RoundFeedback[];
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
  mode?: GameMode;
  viewMode?: "camera" | "recovered";
};

function markerState(
  round: Round,
  roundResults: RoundFeedback[],
): "correct" | "incorrect" | "unguessed" {
  const result = roundResults.find((r) => r.correctId === round.id);
  if (!result) return "unguessed";
  return result.correct ? "correct" : "incorrect";
}

function isRestored(round: Round, roundResults: RoundFeedback[]): boolean {
  return round.restored === true || roundResults.some((result) => result.correct && result.correctId === round.id);
}

/** Pick N random distractor locations from the full webcam pool, excluding envelope rounds */
function pickDistractors(envelopeIds: Set<string>, count: number): Round[] {
  const pool = (rawWebcams as Array<{ id: string; imagePath: string; lat: number; lng: number; city: string; region: string; country: string }>)
    .filter((w) => !envelopeIds.has(w.id))
    .map((w) => ({
      id: `distractor-${w.id}`,
      image: w.imagePath,
      lat: w.lat,
      lng: w.lng,
      city: w.city,
      region: w.region,
      country: w.country,
      source: "windy" as const,
    }));

  // Shuffle and take N
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function FitBoundsOnce({
  rounds,
  fitToBounds,
  fitKey,
}: {
  rounds: Round[];
  fitToBounds?: [[number, number], [number, number]];
  fitKey: string;
}) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    fitted.current = false;
  }, [fitKey]);

  useEffect(() => {
    // Leaflet can initialize with wrong dimensions if the container was
    // hidden or mid-animation. Invalidate after a short delay so tiles
    // render correctly.
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);

  if (!fitted.current) {
    if (fitToBounds) {
      fitted.current = true;
      map.fitBounds(fitToBounds, { padding: [40, 40], maxZoom: 13 });
    } else if (rounds.length > 0) {
      fitted.current = true;
      const bounds = rounds.map((r) => [r.lat, r.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
    }
  }
  return null;
}

export default function WorldMap({
  rounds,
  roundResults,
  selectedId,
  onSelectMarker,
  mode = "global",
  viewMode = "camera",
}: WorldMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isAustin = mode === "austin";
  const isRecoveredView = isAustin && viewMode === "recovered";
  const activeRoundId = rounds[0]?.id ?? null;

  // Pick distractors once when envelope rounds change (stable across re-renders)
  const distractors = useRef<Round[]>([]);
  const lastRoundIds = useRef<string>("");
  const currentIds = rounds.map((r) => r.id).join(",");
  if (currentIds !== lastRoundIds.current) {
    lastRoundIds.current = currentIds;
    if (!isAustin) {
      const envelopeIds = new Set(rounds.map((r) => r.id));
      distractors.current = pickDistractors(envelopeIds, 10);
    } else {
      distractors.current = [];
    }
  }

  const displayRounds = useMemo(() => {
    if (isAustin) {
      const merged = new Map<string, Round>();
      for (const round of austinRounds as Round[]) {
        merged.set(round.id, round);
      }
      for (const round of rounds) {
        merged.set(round.id, round);
      }
      return [...merged.values()];
    }
    // Global: envelope rounds + distractors
    return [...rounds, ...distractors.current];
  }, [isAustin, rounds]);

  // Sort: guessed first (bottom of SVG), unguessed last (top, clickable)
  const sorted = useMemo(() => {
    return [...displayRounds].sort((a, b) => {
      if (isAustin && !isRecoveredView) {
        const aPriority = a.id === activeRoundId ? 2 : 1;
        const bPriority = b.id === activeRoundId ? 2 : 1;
        if (aPriority !== bPriority) return aPriority - bPriority;
      }

      const aState = markerState(a, roundResults);
      const bState = markerState(b, roundResults);
      if (aState === "unguessed" && bState !== "unguessed") return 1;
      if (aState !== "unguessed" && bState === "unguessed") return -1;
      return 0;
    });
  }, [displayRounds, roundResults, isAustin, isRecoveredView, activeRoundId]);

  return (
    <div className="map-container">
      <MapContainer
        center={isAustin ? [30.285, -97.735] : [30, 10]}
        zoom={isAustin ? 11 : 2}
        minZoom={2}
        style={{ width: "100%", height: "100%", background: "#000" }}
        zoomControl={false}
        attributionControl={false}
        worldCopyJump={true}
        maxBounds={isAustin ? AUSTIN_BOUNDS : [[-85, -Infinity], [85, Infinity]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        inertia={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          keepBuffer={6}
          updateWhenZooming={false}
          updateWhenIdle={false}
        />
        <FitBoundsOnce
          rounds={displayRounds}
          fitToBounds={isAustin ? AUSTIN_BOUNDS : undefined}
          fitKey={`${mode}-${viewMode}-${displayRounds.length}`}
        />

        {sorted.map((round) => {
          const state = markerState(round, roundResults);
          const isSelected = selectedId === round.id;
          const isHovered = hoveredId === round.id;
          const isActiveAustinRound = isAustin && round.id === activeRoundId;
          const restored = isRestored(round, roundResults);
          const clickable = isAustin
            ? !isRecoveredView && isActiveAustinRound
            : state === "unguessed";

          if (isAustin) {
            const highlighted = !isRecoveredView && isActiveAustinRound;
            const radius = restored || highlighted || isSelected || isHovered ? 11 : 7;
            const color = restored ? "#66b66e" : isRecoveredView ? "#6f7a78" : highlighted ? "#e8d5b0" : "#6f7a78";
            const fillColor = restored ? "#4a7a4a" : isRecoveredView ? "#414947" : highlighted ? "#d4a24e" : "#414947";
            const fillOpacity = restored ? 0.85 : isRecoveredView ? 0.22 : highlighted ? 0.95 : 0.32;
            const weight = restored || highlighted ? 2.5 : 1;

            return (
              <CircleMarker
                key={`${round.id}-${isRecoveredView ? "recovered" : "camera"}-${restored ? "restored" : "unrestored"}`}
                center={[round.lat, round.lng]}
                radius={radius}
                color={color}
                fillColor={fillColor}
                fillOpacity={fillOpacity}
                weight={weight}
                interactive={clickable}
                bubblingMouseEvents={false}
                eventHandlers={
                  clickable
                    ? {
                        click: () => onSelectMarker(round.id),
                        mouseover: () => setHoveredId(round.id),
                        mouseout: () => setHoveredId(null),
                      }
                    : undefined
                }
              >
                {clickable && (isSelected || isHovered) && (
                  <Tooltip permanent direction="top" offset={[0, -14]}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {round.city}, {round.country}
                    </span>
                  </Tooltip>
                )}
              </CircleMarker>
            );
          }

          if (!clickable) {
            // Guessed markers: small, non-interactive (key includes state to force remount)
            return (
              <CircleMarker
                key={`${round.id}-${state}`}
                center={[round.lat, round.lng]}
                radius={5}
                color={state === "correct" ? "#6aae6a" : "#c06060"}
                fillColor={state === "correct" ? "#4a7a4a" : "#8b0000"}
                fillOpacity={0.5}
                weight={1}
                interactive={false}
              />
            );
          }

          // Unguessed markers: larger, interactive, hover/select states
          const radius = isSelected || isHovered ? 12 : 9;
          const color = isSelected || isHovered ? "#e8d5b0" : "#c4a862";
          const fillColor = isSelected ? "#d4a24e" : isHovered ? "#c4a862" : "#6b5530";
          const fillOpacity = isSelected ? 1 : isHovered ? 0.9 : 0.7;
          const weight = isSelected ? 2.5 : isHovered ? 2 : 1.5;

          return (
            <CircleMarker
              key={`${round.id}-active`}
              center={[round.lat, round.lng]}
              radius={radius}
              color={color}
              fillColor={fillColor}
              fillOpacity={fillOpacity}
              weight={weight}
              interactive={true}
              bubblingMouseEvents={false}
              eventHandlers={{
                click: () => onSelectMarker(round.id),
                mouseover: () => setHoveredId(round.id),
                mouseout: () => setHoveredId(null),
              }}
            >
              {(isSelected || isHovered) && (
                <Tooltip permanent direction="top" offset={[0, -14]}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {round.city}, {round.country}
                  </span>
                </Tooltip>
              )}
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

"use client";

import { useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Round, RoundFeedback } from "../../lib/game/types";

export type WorldMapProps = {
  rounds: Round[];
  roundResults: RoundFeedback[];
  selectedId: string | null;
  onSelectMarker: (id: string) => void;
};

function markerState(
  round: Round,
  roundResults: RoundFeedback[],
): "correct" | "incorrect" | "unguessed" {
  const result = roundResults.find((r) => r.correctId === round.id);
  if (!result) return "unguessed";
  return result.correct ? "correct" : "incorrect";
}

const MARKER_STYLES = {
  unguessed:  { color: "#c4a862", fillColor: "#6b5530", fillOpacity: 0.6, radius: 7, weight: 1.5 },
  hovered:    { color: "#e8d5b0", fillColor: "#c4a862", fillOpacity: 0.9, radius: 11, weight: 2 },
  selected:   { color: "#e8d5b0", fillColor: "#d4a24e", fillOpacity: 1,   radius: 11, weight: 2.5 },
  correct:    { color: "#6aae6a", fillColor: "#4a7a4a", fillOpacity: 0.7, radius: 6, weight: 1.5 },
  incorrect:  { color: "#c06060", fillColor: "#8b0000", fillOpacity: 0.7, radius: 6, weight: 1.5 },
} as const;

function FitBoundsOnce({ rounds }: { rounds: Round[] }) {
  const map = useMap();
  const fitted = useRef(false);
  if (!fitted.current && rounds.length > 0) {
    fitted.current = true;
    const bounds = rounds.map((r) => [r.lat, r.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
  }
  return null;
}

function Marker({
  round,
  state,
  isSelected,
  isHovered,
  onSelect,
  onHoverIn,
  onHoverOut,
}: {
  round: Round;
  state: "correct" | "incorrect" | "unguessed";
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHoverIn: () => void;
  onHoverOut: () => void;
}) {
  const clickable = state === "unguessed";

  let style: { color: string; fillColor: string; fillOpacity: number; radius: number; weight: number };
  if (isSelected) style = MARKER_STYLES.selected;
  else if (isHovered && clickable) style = MARKER_STYLES.hovered;
  else style = MARKER_STYLES[state];

  const showTooltip = isSelected || (isHovered && clickable);

  return (
    <CircleMarker
      center={[round.lat, round.lng]}
      {...style}
      eventHandlers={
        clickable
          ? {
              click: onSelect,
              mouseover: onHoverIn,
              mouseout: onHoverOut,
            }
          : undefined
      }
      interactive={clickable || isSelected}
    >
      {showTooltip && (
        <Tooltip permanent direction="top" offset={[0, -14]}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
            {round.city}, {round.country}
          </span>
        </Tooltip>
      )}
    </CircleMarker>
  );
}

export default function WorldMap({
  rounds,
  roundResults,
  selectedId,
  onSelectMarker,
}: WorldMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleHoverIn = useCallback((id: string) => setHoveredId(id), []);
  const handleHoverOut = useCallback(() => setHoveredId(null), []);

  return (
    <div className="map-container">
      <MapContainer
        center={[30, 10]}
        zoom={2}
        minZoom={2}
        style={{ width: "100%", height: "100%", background: "#000" }}
        zoomControl={false}
        attributionControl={false}
        worldCopyJump={true}
        maxBounds={[[-85, -Infinity], [85, Infinity]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          keepBuffer={6}
          updateWhenZooming={false}
          updateWhenIdle={false}
        />
        <FitBoundsOnce rounds={rounds} />

        {rounds.map((round) => {
          const state = markerState(round, roundResults);
          return (
            <Marker
              key={round.id}
              round={round}
              state={state}
              isSelected={selectedId === round.id}
              isHovered={hoveredId === round.id}
              onSelect={() => onSelectMarker(round.id)}
              onHoverIn={() => handleHoverIn(round.id)}
              onHoverOut={handleHoverOut}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}

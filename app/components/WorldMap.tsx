"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
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

/** Convert two-finger trackpad scroll into pan. Ctrl+scroll zooms. */
function TrackpadPan() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd + scroll = zoom
        const delta = e.deltaY > 0 ? -1 : 1;
        map.zoomIn(delta, { animate: true });
      } else {
        // Normal scroll = pan
        map.panBy([e.deltaX, e.deltaY], { animate: false });
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [map]);

  return null;
}

function FitBoundsOnce({ rounds }: { rounds: Round[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    // Leaflet can initialize with wrong dimensions if the container was
    // hidden or mid-animation. Invalidate after a short delay so tiles
    // render correctly.
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);

  if (!fitted.current && rounds.length > 0) {
    fitted.current = true;
    const bounds = rounds.map((r) => [r.lat, r.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
  }
  return null;
}

export default function WorldMap({
  rounds,
  roundResults,
  selectedId,
  onSelectMarker,
}: WorldMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sort: guessed first (bottom of SVG), unguessed last (top, clickable)
  const sorted = useMemo(() => {
    return [...rounds].sort((a, b) => {
      const aState = markerState(a, roundResults);
      const bState = markerState(b, roundResults);
      if (aState === "unguessed" && bState !== "unguessed") return 1;
      if (aState !== "unguessed" && bState === "unguessed") return -1;
      return 0;
    });
  }, [rounds, roundResults]);

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
        scrollWheelZoom={false}
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
        <FitBoundsOnce rounds={rounds} />
        <TrackpadPan />

        {sorted.map((round) => {
          const state = markerState(round, roundResults);
          const isSelected = selectedId === round.id;
          const isHovered = hoveredId === round.id;
          const clickable = state === "unguessed";

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

"use client";

import dynamic from "next/dynamic";
import type { WorldMapProps } from "./WorldMap";

const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--desk)",
        color: "var(--text-muted)",
        fontSize: 13,
      }}
    >
      Loading map...
    </div>
  ),
});

export default function WorldMapLoader(props: WorldMapProps) {
  return <WorldMap {...props} />;
}

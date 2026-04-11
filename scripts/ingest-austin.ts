import { mkdir, writeFile } from "node:fs/promises";

import type { Round } from "../lib/game/types";

export type AustinCameraRow = {
  id: string;
  location: {
    coordinates: [number, number];
    name?: string | null;
    primaryStreet?: string | null;
    crossStreet?: string | null;
    landmark?: string | null;
  };
};

export function mapAustinRowToRound(row: AustinCameraRow): Round {
  const [lng, lat] = row.location.coordinates;

  return {
    id: `austin-${row.id}`,
    cameraId: row.id,
    image: `/rounds/austin/${row.id}.jpg`,
    lat,
    lng,
    city: "Austin",
    region: "Texas",
    country: "USA",
    source: "austin",
    mode: "austin",
    locationName: row.location.name?.trim() ?? "",
    primaryStreet: row.location.primaryStreet?.trim() ?? "",
    crossStreet: row.location.crossStreet?.trim() ?? "",
    landmark: row.location.landmark?.trim() ?? "",
  };
}

export async function ensureAustinDirs() {
  await mkdir("public/rounds/austin", { recursive: true });
  await mkdir("data", { recursive: true });
}

async function main() {
  await ensureAustinDirs();
  await writeFile("data/rounds-austin.json", "[]\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}

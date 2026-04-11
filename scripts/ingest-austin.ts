import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { Round } from "../lib/game/types";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const austinRoundDir = path.join(projectRoot, "public/rounds/austin");
const austinDataPath = path.join(projectRoot, "data/rounds-austin.json");

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
  await mkdir(austinRoundDir, { recursive: true });
  await mkdir(path.dirname(austinDataPath), { recursive: true });
}

async function main() {
  await ensureAustinDirs();
  await writeFile(austinDataPath, "[]\n");
}

const directRunTarget = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";

if (import.meta.url === directRunTarget) {
  void main();
}

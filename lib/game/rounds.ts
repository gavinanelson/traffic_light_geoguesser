import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { GameMode, Round } from "./types";
import approvedRounds from "../../data/rounds.json";
import austinRounds from "../../data/rounds-austin.json";
import rawWebcams from "../../data/raw-webcams.json";

type RawWebcam = {
  id: string;
  imagePath: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  country: string;
  [key: string]: unknown;
};

type ApprovedRoundRecord = {
  id: string;
  image?: string;
  filename?: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  country: string;
};

type ApprovedRoundsManifest =
  | ApprovedRoundRecord[]
  | {
      rounds: ApprovedRoundRecord[];
    };

function normalizeApprovedRoundImage(imageOrFilename: string): string {
  const normalized = imageOrFilename.replace(/^\/+/, "").replaceAll("\\", "/");

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  if (normalized.startsWith("api/approved-rounds/")) {
    return `/${normalized}`;
  }

  return `/api/approved-rounds/${normalized}`;
}

function shuffleRounds(rounds: Round[], rng: () => number): Round[] {
  const shuffled = [...rounds];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function mapRawToRound(raw: RawWebcam): Round {
  return {
    id: raw.id,
    image: raw.imagePath,
    lat: raw.lat,
    lng: raw.lng,
    city: raw.city,
    region: raw.region,
    country: raw.country,
    source: "windy",
  };
}

export function loadApprovedRounds(rootDir = process.cwd()): Round[] {
  const manifestPath = path.join(rootDir, "approved-rounds", "manifest.json");

  if (!existsSync(manifestPath)) {
    return [];
  }

  const rawManifest = JSON.parse(readFileSync(manifestPath, "utf8")) as ApprovedRoundsManifest;
  const records = Array.isArray(rawManifest) ? rawManifest : rawManifest.rounds;

  return records.map((record) => ({
    id: record.id,
    image: normalizeApprovedRoundImage(record.image ?? record.filename ?? record.id),
    lat: record.lat,
    lng: record.lng,
    city: record.city,
    region: record.region,
    country: record.country,
    source: "windy",
  }));
}

export function selectEnvelope(
  rounds: Round[],
  count = 10,
  rng: () => number = Math.random,
): Round[] {
  if (rounds.length <= count) {
    return shuffleRounds(rounds, rng);
  }

  const pool = [...rounds];
  const envelope: Round[] = [];

  while (pool.length > 0 && envelope.length < count) {
    const index = Math.floor(rng() * pool.length);
    const [selected] = pool.splice(index, 1);

    if (selected) {
      envelope.push(selected);
    }
  }

  return envelope;
}

function loadGlobalRounds(rootDir = process.cwd()): Round[] {
  const folderBackedRounds = loadApprovedRounds(rootDir);

  if (folderBackedRounds.length > 0) {
    return folderBackedRounds;
  }

  if (approvedRounds.length > 0) return approvedRounds as Round[];
  return (rawWebcams as RawWebcam[]).map(mapRawToRound);
}

export function loadRoundsForMode(mode: GameMode, rootDir = process.cwd()): Round[] {
  if (mode === "austin") {
    return austinRounds as Round[];
  }

  return loadGlobalRounds(rootDir);
}

export function loadRounds(rootDir = process.cwd()): Round[] {
  return loadRoundsForMode("global", rootDir);
}

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

function loadGlobalRounds(): Round[] {
  if (approvedRounds.length > 0) return approvedRounds as Round[];
  return (rawWebcams as RawWebcam[]).map(mapRawToRound);
}

export function loadRoundsForMode(mode: GameMode): Round[] {
  if (mode === "austin") {
    return austinRounds as Round[];
  }

  return loadGlobalRounds();
}

export function loadRounds(): Round[] {
  return loadRoundsForMode("global");
}

import type { Round } from "./types";
import approvedRounds from "../../data/rounds.json";
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

export function selectEnvelope(rounds: Round[], count = 10): Round[] {
  const shuffled = [...rounds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function loadRounds(): Round[] {
  if (approvedRounds.length > 0) return approvedRounds as Round[];
  return (rawWebcams as RawWebcam[]).map(mapRawToRound);
}

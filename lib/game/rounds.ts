import type { Round } from "./types";

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

export async function loadRounds(): Promise<Round[]> {
  const roundsMod = await import("../../data/rounds.json");
  const rounds: Round[] = roundsMod.default;
  if (rounds.length > 0) return rounds;

  const rawMod = await import("../../data/raw-webcams.json");
  const raw: RawWebcam[] = rawMod.default;
  return raw.map(mapRawToRound);
}

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ReviewDecision = "approved" | "rejected";

export type RawWebcamRecord = {
  id: string;
  webcamId: number;
  title: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  country: string;
  imagePath: string;
  providerUrl: string;
  windyDetailUrl: string;
  categories: string[];
  capturedAt: string;
  scores?: {
    brightness: number;
    contrast: number;
    edgeDensity: number;
    isLikelyTooDark: boolean;
  };
};

export type ReviewMap = Record<string, ReviewDecision>;

const rawPath = path.join(process.cwd(), "data", "raw-webcams.json");
const reviewPath = path.join(process.cwd(), "data", "review.json");

export function getPendingCandidates(
  records: RawWebcamRecord[],
  reviewMap: ReviewMap
) {
  return records.filter((record) => !reviewMap[record.id]);
}

export async function readRawWebcams() {
  const raw = await readFile(rawPath, "utf8");
  return JSON.parse(raw) as RawWebcamRecord[];
}

export async function readReviewMap() {
  const raw = await readFile(reviewPath, "utf8");
  return JSON.parse(raw) as ReviewMap;
}

export async function saveDecision(id: string, decision: ReviewDecision) {
  const reviewMap = await readReviewMap();
  reviewMap[id] = decision;
  await writeFile(reviewPath, JSON.stringify(reviewMap, null, 2));
  return reviewMap;
}

export async function writeReviewMap(reviewMap: ReviewMap) {
  await writeFile(reviewPath, JSON.stringify(reviewMap, null, 2));
}

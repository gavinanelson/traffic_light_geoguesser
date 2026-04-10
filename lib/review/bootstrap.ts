import { readFile, writeFile } from "node:fs/promises";

import { applyAutoRejects } from "./auto-filter";
import { ingestWindyDataset } from "../../scripts/ingest-windy";
import { scoreRawWebcams } from "../../scripts/score-images";
import { readReviewMap } from "./store";

export async function bootstrapReviewDataset(targetCount = 500) {
  await ingestWindyDataset({
    targetCount
  });

  const records = await scoreRawWebcams();
  const reviewMap = await readReviewMap();
  const nextReviewMap = applyAutoRejects(records, reviewMap);

  await writeFile("data/review.json", JSON.stringify(nextReviewMap, null, 2));

  const autoRejected = Object.entries(nextReviewMap).filter(
    ([, value]) => value === "rejected"
  ).length;

  return {
    total: records.length,
    autoRejected
  };
}

export async function readBootstrapSummary() {
  const raw = await readFile("data/raw-webcams.json", "utf8");
  const records = JSON.parse(raw) as Array<{ id: string }>;
  return {
    total: records.length
  };
}


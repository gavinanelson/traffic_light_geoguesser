import type { RawWebcamRecord, ReviewMap } from "./store";

export const AUTO_REJECT_BRIGHTNESS = 45;
export const AUTO_REJECT_CONTRAST = 18;

export function shouldAutoReject(record: RawWebcamRecord) {
  const brightness = record.scores?.brightness ?? 0;
  const contrast = record.scores?.contrast ?? 0;

  return brightness < AUTO_REJECT_BRIGHTNESS || contrast < AUTO_REJECT_CONTRAST;
}

export function applyAutoRejects(records: RawWebcamRecord[], reviewMap: ReviewMap) {
  const nextReviewMap = { ...reviewMap };

  for (const record of records) {
    if (!nextReviewMap[record.id] && shouldAutoReject(record)) {
      nextReviewMap[record.id] = "rejected";
    }
  }

  return nextReviewMap;
}


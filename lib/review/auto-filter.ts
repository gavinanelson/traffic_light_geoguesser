import type { RawWebcamRecord, ReviewMap } from "./store";

export const AUTO_REJECT_BRIGHTNESS = 45;
export const AUTO_REJECT_CONTRAST = 18;
export const AUTO_REJECT_DARK_PIXEL_RATIO = 0.55;
export const AUTO_REJECT_COLORFULNESS = 8;
export const AUTO_REJECT_LARGE_TEXT = 0.12;

export function shouldAutoReject(record: RawWebcamRecord) {
  const brightness = record.scores?.brightness ?? 0;
  const contrast = record.scores?.contrast ?? 0;
  const darkPixelRatio = record.scores?.darkPixelRatio ?? 1;
  const colorfulness = record.scores?.colorfulness ?? 0;
  const largeTextLikelihood = record.scores?.largeTextLikelihood ?? 0;

  return (
    brightness < AUTO_REJECT_BRIGHTNESS ||
    contrast < AUTO_REJECT_CONTRAST ||
    darkPixelRatio > AUTO_REJECT_DARK_PIXEL_RATIO ||
    colorfulness < AUTO_REJECT_COLORFULNESS ||
    largeTextLikelihood > AUTO_REJECT_LARGE_TEXT
  );
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


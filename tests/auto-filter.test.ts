import { describe, expect, it } from "vitest";

import { applyAutoRejects, shouldAutoReject } from "../lib/review/auto-filter";
import type { RawWebcamRecord } from "../lib/review/store";

const baseRecord: RawWebcamRecord = {
  id: "cam-1",
  webcamId: 1,
  title: "Camera",
  lat: 1,
  lng: 2,
  city: "City",
  region: "Region",
  country: "Country",
  imagePath: "/rounds/cam-1.jpg",
  providerUrl: "",
  windyDetailUrl: "",
  categories: ["traffic"],
  capturedAt: "2026-04-10T00:00:00.000Z",
  scores: {
    brightness: 60,
    contrast: 30,
    edgeDensity: 0.1,
    isLikelyTooDark: false
  }
};

describe("shouldAutoReject", () => {
  it("rejects images that are too dark", () => {
    expect(
      shouldAutoReject({
        ...baseRecord,
        scores: { ...baseRecord.scores!, brightness: 30 }
      })
    ).toBe(true);
  });

  it("rejects images with too little contrast", () => {
    expect(
      shouldAutoReject({
        ...baseRecord,
        scores: { ...baseRecord.scores!, contrast: 10 }
      })
    ).toBe(true);
  });

  it("keeps images that clear both thresholds", () => {
    expect(shouldAutoReject(baseRecord)).toBe(false);
  });
});

describe("applyAutoRejects", () => {
  it("marks only undecided low-quality records as rejected", () => {
    const result = applyAutoRejects(
      [
        {
          ...baseRecord,
          id: "keep"
        },
        {
          ...baseRecord,
          id: "drop",
          scores: { ...baseRecord.scores!, brightness: 20 }
        }
      ],
      { keep: "approved" }
    );

    expect(result).toEqual({
      keep: "approved",
      drop: "rejected"
    });
  });
});


import { describe, expect, it } from "vitest";

import { getPendingCandidates, type RawWebcamRecord } from "../lib/review/store";

const sampleRecord = (id: string): RawWebcamRecord => ({
  id,
  webcamId: 1,
  title: id,
  lat: 1,
  lng: 2,
  city: "City",
  region: "Region",
  country: "Country",
  imagePath: `/rounds/${id}.jpg`,
  providerUrl: "",
  windyDetailUrl: "",
  categories: ["traffic"],
  capturedAt: "2026-04-10T00:00:00.000Z"
});

describe("getPendingCandidates", () => {
  it("returns only undecided records", () => {
    const records = [sampleRecord("a"), sampleRecord("b"), sampleRecord("c")];

    expect(getPendingCandidates(records, { b: "approved", c: "rejected" })).toEqual([
      sampleRecord("a")
    ]);
  });
});


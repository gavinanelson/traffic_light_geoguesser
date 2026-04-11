import { describe, expect, it } from "vitest";
import { selectEnvelope, mapRawToRound } from "../lib/game/rounds";
import type { Round } from "../lib/game/types";

const fakeRounds: Round[] = Array.from({ length: 20 }, (_, i) => ({
  id: `city-${i}`,
  image: `/rounds/city-${i}.jpg`,
  lat: i,
  lng: i * 2,
  city: `City ${i}`,
  region: `Region ${i}`,
  country: `Country ${i}`,
  source: "windy" as const,
}));

describe("selectEnvelope", () => {
  it("returns exactly 10 rounds by default", () => {
    const envelope = selectEnvelope(fakeRounds);
    expect(envelope).toHaveLength(10);
  });

  it("returns a custom count when specified", () => {
    const envelope = selectEnvelope(fakeRounds, 5);
    expect(envelope).toHaveLength(5);
  });

  it("returns all rounds if pool is smaller than requested count", () => {
    const small = fakeRounds.slice(0, 3);
    const envelope = selectEnvelope(small, 10);
    expect(envelope).toHaveLength(3);
  });

  it("does not mutate the input array", () => {
    const copy = [...fakeRounds];
    selectEnvelope(fakeRounds);
    expect(fakeRounds).toEqual(copy);
  });
});

describe("mapRawToRound", () => {
  it("maps raw webcam fields to Round shape", () => {
    const raw = {
      id: "london-123",
      imagePath: "/rounds/london-123.jpg",
      lat: 51.5,
      lng: -0.1,
      city: "London",
      region: "England",
      country: "United Kingdom",
      webcamId: 123,
      title: "London: Something",
      providerUrl: "http://example.com",
      windyDetailUrl: "http://windy.com/123",
      categories: ["traffic"],
      capturedAt: "2026-04-10T00:00:00Z",
    };
    const round = mapRawToRound(raw);
    expect(round).toEqual({
      id: "london-123",
      image: "/rounds/london-123.jpg",
      lat: 51.5,
      lng: -0.1,
      city: "London",
      region: "England",
      country: "United Kingdom",
      source: "windy",
    });
  });
});

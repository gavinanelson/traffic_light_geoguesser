import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";
import approvedManifest from "../approved-rounds/manifest.json";
import austinRounds from "../data/rounds-austin.json";
import rawWebcams from "../data/raw-webcams.json";
import {
  loadApprovedRounds,
  loadRoundsForMode,
  selectEnvelope,
  mapRawToRound,
} from "../lib/game/rounds";
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

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();

    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

function createApprovedRoundsFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "approved-rounds-"));
  const approvedRoundsDir = path.join(root, "approved-rounds");
  const imagesDir = path.join(approvedRoundsDir, "images");

  mkdirSync(imagesDir, { recursive: true });
  writeFileSync(path.join(imagesDir, "alpha.jpg"), "jpg");
  writeFileSync(
    path.join(approvedRoundsDir, "manifest.json"),
    JSON.stringify({
      rounds: [
        {
          id: "alpha",
          filename: "images/alpha.jpg",
          lat: 30.2672,
          lng: -97.7431,
          city: "Austin",
          region: "Texas",
          country: "USA",
        },
      ],
    }),
  );

  tempDirs.push(root);

  return root;
}

describe("selectEnvelope", () => {
  it("returns exactly 10 rounds by default", () => {
    const envelope = selectEnvelope(fakeRounds);

    expect(envelope).toHaveLength(10);
  });

  it("returns a custom count when specified", () => {
    const envelope = selectEnvelope(fakeRounds, 5);

    expect(envelope).toHaveLength(5);
  });

  it("selects a single round when count is 1", () => {
    const envelope = selectEnvelope(fakeRounds, 1, () => 0.95);

    expect(envelope).toHaveLength(1);
    expect(envelope[0]?.id).toBe("city-19");
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


describe("loadRoundsForMode", () => {
  it("returns the Austin dataset for Austin mode", () => {
    expect(loadRoundsForMode("austin")).toBe(austinRounds);
  });

  it("falls back to mapped raw webcams for global mode", () => {
    const isolatedRoot = mkdtempSync(path.join(tmpdir(), "global-rounds-fallback-"));
    tempDirs.push(isolatedRoot);
    const globalRounds = loadRoundsForMode("global", isolatedRoot);

    expect(globalRounds).toHaveLength(rawWebcams.length);
    expect(globalRounds[0]).toEqual(mapRawToRound(rawWebcams[0]));
  });
});

describe("loadApprovedRounds", () => {
  it("loads rounds from an approved-rounds manifest", () => {
    const fixtureRoot = createApprovedRoundsFixture();

    expect(loadApprovedRounds(fixtureRoot)).toEqual([
      {
        id: "alpha",
        image: "/api/approved-rounds/images/alpha.jpg",
        lat: 30.2672,
        lng: -97.7431,
        city: "Austin",
        region: "Texas",
        country: "USA",
        source: "windy",
      },
    ]);
  });

  it("prefers approved-rounds manifest data for global mode when present", () => {
    const fixtureRoot = createApprovedRoundsFixture();

    expect(loadRoundsForMode("global", fixtureRoot)).toEqual([
      {
        id: "alpha",
        image: "/api/approved-rounds/images/alpha.jpg",
        lat: 30.2672,
        lng: -97.7431,
        city: "Austin",
        region: "Texas",
        country: "USA",
        source: "windy",
      },
    ]);
  });

  it("uses the repo approved-rounds manifest for local global mode", () => {
    const manifestRounds = Array.isArray(approvedManifest)
      ? approvedManifest
      : approvedManifest.rounds;
    const globalRounds = loadRoundsForMode("global");

    expect(globalRounds).toHaveLength(manifestRounds.length);
    expect(globalRounds[0]).toEqual({
      id: manifestRounds[0].id,
      image: `/api/approved-rounds/${manifestRounds[0].filename}`,
      lat: manifestRounds[0].lat,
      lng: manifestRounds[0].lng,
      city: manifestRounds[0].city,
      region: manifestRounds[0].region,
      country: manifestRounds[0].country,
      source: "windy",
    });
    expect(globalRounds.every((round) => round.image.startsWith("/api/approved-rounds/"))).toBe(true);
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

it("supports Austin mode round metadata", () => {
  const round: Round = {
    id: "austin-649",
    image: "/rounds/austin/649.jpg",
    lat: 30.258518,
    lng: -97.728668,
    city: "Austin",
    region: "Texas",
    country: "USA",
    source: "austin",
    mode: "austin",
    locationName: "CESAR CHAVEZ ST / COMAL ST",
    cameraId: "649",
  };

  expect(round.mode).toBe("austin");
  expect(round.source).toBe("austin");
  expect(round.cameraId).toBe("649");
});

import { describe, expect, it } from "vitest";
import austinRounds from "../data/rounds-austin.json";
import rawWebcams from "../data/raw-webcams.json";
import { GET } from "../app/api/envelope/route";
import { requestEnvelope } from "../lib/game/envelope-client";
import { loadRoundsForMode, mapRawToRound } from "../lib/game/rounds";
import type { Round } from "../lib/game/types";

const fakeRounds: Round[] = [
  {
    id: "one",
    image: "/rounds/one.jpg",
    lat: 1,
    lng: 2,
    city: "One",
    region: "Region One",
    country: "Country One",
    source: "windy",
  },
];

describe("requestEnvelope", () => {
  it("requests a mode-aware envelope from the server route", async () => {
    const fetchImpl: typeof fetch = (async (input) => {
      expect(String(input)).toBe("/api/envelope?mode=austin&count=10");
      return new Response(JSON.stringify({ rounds: fakeRounds }), { status: 200 });
    }) as typeof fetch;

    await expect(requestEnvelope(fetchImpl, "austin")).resolves.toEqual(fakeRounds);
  });

  it("throws when the server returns a bad response", async () => {
    const fetchImpl: typeof fetch = (async () =>
      new Response(JSON.stringify({ error: "missing rounds" }), { status: 503 })) as typeof fetch;

    await expect(requestEnvelope(fetchImpl, "global", 10)).rejects.toThrow(
      "missing rounds",
    );
  });
});

describe("loadRoundsForMode", () => {
  it("returns the Austin dataset for Austin mode", () => {
    expect(loadRoundsForMode("austin")).toBe(austinRounds);
  });

  it("falls back to mapped raw webcams for global mode", () => {
    const globalRounds = loadRoundsForMode("global");

    expect(globalRounds).toHaveLength(rawWebcams.length);
    expect(globalRounds[0]).toEqual(mapRawToRound(rawWebcams[0]));
  });
});

describe("GET /api/envelope", () => {
  it("returns a mode-specific 503 for Austin mode when no rounds exist", async () => {
    const response = await GET(new Request("http://localhost/api/envelope?mode=austin&count=1"));

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "No Austin rounds available" });
  });
});

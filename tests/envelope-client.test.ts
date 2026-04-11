import { describe, expect, it, vi } from "vitest";
import austinRounds from "../data/rounds-austin.json";
import rawWebcams from "../data/raw-webcams.json";
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

async function importRouteWithMocks(
  loadRoundsForModeMock: ReturnType<typeof vi.fn>,
  selectEnvelopeMock: ReturnType<typeof vi.fn>,
) {
  vi.resetModules();
  vi.doMock("../lib/game/rounds", () => ({
    loadRoundsForMode: loadRoundsForModeMock,
    selectEnvelope: selectEnvelopeMock,
  }));

  return import("../app/api/envelope/route");
}

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
  it("returns a mode-specific 503 when Austin mode has no rounds", async () => {
    const loadRoundsForModeMock = vi.fn(() => []);
    const selectEnvelopeMock = vi.fn();
    const { GET } = await importRouteWithMocks(loadRoundsForModeMock, selectEnvelopeMock);

    const response = await GET(new Request("http://localhost/api/envelope?mode=austin&count=1"));
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body).toEqual({ error: "No Austin rounds available" });
    expect(loadRoundsForModeMock).toHaveBeenCalledWith("austin");
    expect(selectEnvelopeMock).not.toHaveBeenCalled();
  });

  it("returns a no-store envelope response for Austin mode", async () => {
    const rounds = [
      {
        id: "austin-1",
        image: "/rounds/austin/1.jpg",
        lat: 30.25,
        lng: -97.75,
        city: "Austin",
        region: "Texas",
        country: "USA",
        source: "austin" as const,
        mode: "austin" as const,
      },
      {
        id: "austin-2",
        image: "/rounds/austin/2.jpg",
        lat: 30.26,
        lng: -97.76,
        city: "Austin",
        region: "Texas",
        country: "USA",
        source: "austin" as const,
        mode: "austin" as const,
      },
    ];
    const loadRoundsForModeMock = vi.fn(() => rounds);
    const selectEnvelopeMock = vi.fn((loadedRounds: Round[], count: number) => loadedRounds.slice(0, count));
    const { GET } = await importRouteWithMocks(loadRoundsForModeMock, selectEnvelopeMock);

    const response = await GET(new Request("http://localhost/api/envelope?mode=austin&count=1"));
    const body = (await response.json()) as { rounds: Round[] };

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.rounds).toEqual([rounds[0]]);
    expect(loadRoundsForModeMock).toHaveBeenCalledWith("austin");
    expect(selectEnvelopeMock).toHaveBeenCalledWith(rounds, 1);
  });
});

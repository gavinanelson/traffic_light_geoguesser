import { describe, expect, it } from "vitest";

import { distanceKm, scoreGuess } from "../lib/game/score";

describe("distanceKm", () => {
  it("returns zero for identical coordinates", () => {
    expect(distanceKm(46.22603, 6.10194, 46.22603, 6.10194)).toBeCloseTo(0, 4);
  });
});

describe("scoreGuess", () => {
  it("gives max score for exact guesses", () => {
    expect(scoreGuess(0)).toBe(5000);
  });

  it("decreases as distance increases", () => {
    expect(scoreGuess(50)).toBeGreaterThan(scoreGuess(500));
  });
});


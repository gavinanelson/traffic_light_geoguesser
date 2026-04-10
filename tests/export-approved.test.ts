import { describe, expect, it } from "vitest";

import { buildApprovedRounds } from "../scripts/export-approved";

describe("buildApprovedRounds", () => {
  it("exports only approved entries", () => {
    const rounds = buildApprovedRounds(
      [
        {
          id: "a",
          lat: 1,
          lng: 2,
          imagePath: "/rounds/a.jpg",
          city: "A",
          region: "R",
          country: "C"
        }
      ],
      { a: "approved", b: "rejected" }
    );

    expect(rounds).toHaveLength(1);
    expect(rounds[0]?.id).toBe("a");
  });
});


import { mkdtemp, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { expect, it } from "vitest";
import { mapAustinRowToRound } from "../scripts/ingest-austin";
import type { AustinCameraRow } from "../scripts/ingest-austin";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(process.cwd());

it("maps an Austin camera row into a runtime round", () => {
  const row: AustinCameraRow = {
    id: "649",
    location: {
      coordinates: [-97.728668, 30.258518],
      name: "  CESAR CHAVEZ ST / COMAL ST  ",
      primaryStreet: "  CESAR CHAVEZ ST  ",
      crossStreet: "  COMAL ST  ",
      landmark: null,
    },
  };

  expect(mapAustinRowToRound(row)).toEqual({
    id: "austin-649",
    cameraId: "649",
    image: "/rounds/austin/649.jpg",
    lat: 30.258518,
    lng: -97.728668,
    city: "Austin",
    region: "Texas",
    country: "USA",
    source: "austin",
    mode: "austin",
    locationName: "CESAR CHAVEZ ST / COMAL ST",
    primaryStreet: "CESAR CHAVEZ ST",
    crossStreet: "COMAL ST",
    landmark: "",
  });
});

it("writes Austin scaffold files at the repo root when run from another directory", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "austin-ingest-"));

  try {
    await execFileAsync("npx", ["tsx", path.join(repoRoot, "scripts/ingest-austin.ts")], {
      cwd: tempDir,
    });

    await expect(stat(path.join(repoRoot, "public/rounds/austin"))).resolves.toBeDefined();
    await expect(stat(path.join(repoRoot, "data/rounds-austin.json"))).resolves.toBeDefined();
    await expect(stat(path.join(tempDir, "public/rounds/austin"))).rejects.toThrow();
    await expect(stat(path.join(tempDir, "data/rounds-austin.json"))).rejects.toThrow();
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

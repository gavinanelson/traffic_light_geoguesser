import { expect, it } from "vitest";
import { mapAustinRowToRound } from "../scripts/ingest-austin";
import type { AustinCameraRow } from "../scripts/ingest-austin";

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

import { readFile, writeFile } from "node:fs/promises";

type RawRound = {
  id: string;
  imagePath: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  country: string;
};

type ReviewMap = Record<string, string>;

export function buildApprovedRounds(raw: RawRound[], review: ReviewMap) {
  return raw
    .filter((item) => review[item.id] === "approved")
    .map((item) => ({
      id: item.id,
      image: item.imagePath,
      lat: item.lat,
      lng: item.lng,
      city: item.city,
      region: item.region,
      country: item.country,
      source: "windy" as const
    }));
}

async function main() {
  const raw = JSON.parse(await readFile("data/raw-webcams.json", "utf8")) as RawRound[];
  const review = JSON.parse(await readFile("data/review.json", "utf8")) as ReviewMap;
  const rounds = buildApprovedRounds(raw, review);

  await writeFile("data/rounds.json", JSON.stringify(rounds, null, 2));
  console.log(`Exported ${rounds.length} approved rounds`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}

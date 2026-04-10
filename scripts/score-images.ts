import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import type { RawWebcamRecord } from "../lib/review/store";

async function scoreImage(localPath: string) {
  const image = sharp(localPath);
  const stats = await image.stats();
  const brightness =
    (stats.channels[0].mean + stats.channels[1].mean + stats.channels[2].mean) / 3;
  const contrast =
    (stats.channels[0].stdev + stats.channels[1].stdev + stats.channels[2].stdev) / 3;

  const { data, info } = await image
    .greyscale()
    .resize(160, 90, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let edgeHits = 0;

  for (let y = 1; y < info.height; y += 1) {
    for (let x = 1; x < info.width; x += 1) {
      const index = y * info.width + x;
      const delta =
        Math.abs(data[index] - data[index - 1]) +
        Math.abs(data[index] - data[index - info.width]);

      if (delta > 45) {
        edgeHits += 1;
      }
    }
  }

  return {
    brightness,
    contrast,
    edgeDensity: edgeHits / (info.width * info.height),
    isLikelyTooDark: brightness < 45
  };
}

export async function scoreRawWebcams() {
  const raw = (await readFile("data/raw-webcams.json", "utf8")) || "[]";
  const records = JSON.parse(raw) as RawWebcamRecord[];

  for (const record of records) {
    const localPath = path.join("public", record.imagePath.replace(/^\//, ""));
    record.scores = await scoreImage(localPath);
  }

  await writeFile("data/raw-webcams.json", JSON.stringify(records, null, 2));
  return records;
}

async function main() {
  const records = await scoreRawWebcams();
  console.log(`Scored ${records.length} records`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}

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
    .resize(160, 90, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let edgeHits = 0;
  let darkPixels = 0;
  let colorfulnessTotal = 0;
  let largeTextHits = 0;
  let overlayBandPixels = 0;

  for (let y = 1; y < info.height; y += 1) {
    for (let x = 1; x < info.width; x += 1) {
      const pixelIndex = (y * info.width + x) * info.channels;
      const leftIndex = pixelIndex - info.channels;
      const upIndex = pixelIndex - info.width * info.channels;

      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];

      const grey = Math.round((r + g + b) / 3);
      const leftGrey = Math.round((data[leftIndex] + data[leftIndex + 1] + data[leftIndex + 2]) / 3);
      const upGrey = Math.round((data[upIndex] + data[upIndex + 1] + data[upIndex + 2]) / 3);

      const delta = Math.abs(grey - leftGrey) + Math.abs(grey - upGrey);
      if (delta > 45) {
        edgeHits += 1;
      }

      if (r < 32 && g < 32 && b < 32) {
        darkPixels += 1;
      }

      const rg = Math.abs(r - g);
      const yb = Math.abs(0.5 * (r + g) - b);
      colorfulnessTotal += rg + yb;

      const inOverlayBand = y < info.height * 0.22 || y > info.height * 0.78;
      if (inOverlayBand) {
        overlayBandPixels += 1;
        const isExtreme = grey < 30 || grey > 225;
        const hasSharpLocalContrast = delta > 110;
        if (isExtreme && hasSharpLocalContrast) {
          largeTextHits += 1;
        }
      }
    }
  }

  const totalPixels = info.width * info.height;

  return {
    brightness,
    contrast,
    edgeDensity: edgeHits / totalPixels,
    darkPixelRatio: darkPixels / totalPixels,
    colorfulness: colorfulnessTotal / totalPixels,
    largeTextLikelihood: overlayBandPixels ? largeTextHits / overlayBandPixels : 0,
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

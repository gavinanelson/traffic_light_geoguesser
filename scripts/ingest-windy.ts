import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type WindyWebcam = {
  webcamId: number;
  title: string;
  categories: Array<{ id: string }>;
  images?: {
    current?: {
      preview?: string;
    };
  };
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    region?: string;
    country?: string;
  };
  urls?: {
    provider?: string;
    detail?: string;
  };
};

type RawWebcamRecord = {
  id: string;
  webcamId: number;
  title: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  country: string;
  imagePath: string;
  providerUrl: string;
  windyDetailUrl: string;
  categories: string[];
  capturedAt: string;
};

const API_URL = "https://api.windy.com/webcams/api/v3/webcams";
const MAX_LIMIT = 50;

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function fetchTrafficWebcams(limit: number, offset: number) {
  const key = process.env.WINDY_API_KEY;

  if (!key) {
    throw new Error("WINDY_API_KEY is required");
  }

  const params = new URLSearchParams({
    categories: "traffic",
    limit: String(limit),
    offset: String(offset),
    include: "location,images,urls,categories"
  });

  const response = await fetch(`${API_URL}?${params.toString()}`, {
    headers: {
      "x-windy-api-key": key
    }
  });

  if (!response.ok) {
    throw new Error(`Windy request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as { webcams: WindyWebcam[] };
  return payload.webcams;
}

async function downloadImage(url: string, outputPath: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, buffer);
}

export async function ingestWindyDataset({
  targetCount = Number(process.env.WINDY_TARGET_COUNT ?? "500"),
  startOffset = Number(process.env.WINDY_OFFSET ?? "0")
} = {}) {
  await mkdir("data", { recursive: true });
  await mkdir("public/rounds", { recursive: true });

  const records: RawWebcamRecord[] = [];
  const seen = new Set<number>();
  let offset = startOffset;

  while (records.length < targetCount) {
    const remaining = targetCount - records.length;
    const limit = Math.min(MAX_LIMIT, remaining);
    const webcams = await fetchTrafficWebcams(limit, offset);

    if (webcams.length === 0) {
      break;
    }

    for (const webcam of webcams) {
      if (seen.has(webcam.webcamId)) {
        continue;
      }

      seen.add(webcam.webcamId);
      const previewUrl = webcam.images?.current?.preview;
      const lat = webcam.location?.latitude;
      const lng = webcam.location?.longitude;

      if (!previewUrl || typeof lat !== "number" || typeof lng !== "number") {
        continue;
      }

      const city = webcam.location.city ?? "unknown";
      const slug = slugify(`${city}-${webcam.webcamId}`) || `webcam-${webcam.webcamId}`;
      const outputPath = path.join("public", "rounds", `${slug}.jpg`);

      try {
        await downloadImage(previewUrl, outputPath);
        records.push({
          id: slug,
          webcamId: webcam.webcamId,
          title: webcam.title,
          lat,
          lng,
          city,
          region: webcam.location.region ?? "",
          country: webcam.location.country ?? "",
          imagePath: `/rounds/${slug}.jpg`,
          providerUrl: webcam.urls?.provider ?? "",
          windyDetailUrl: webcam.urls?.detail ?? "",
          categories: webcam.categories.map((item) => item.id),
          capturedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Skipping ${webcam.webcamId}:`, error);
      }

      if (records.length >= targetCount) {
        break;
      }
    }

    offset += webcams.length;
  }

  await writeFile("data/raw-webcams.json", JSON.stringify(records, null, 2));
  return records;
}

async function main() {
  const records = await ingestWindyDataset();
  console.log(`Saved ${records.length} records`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}

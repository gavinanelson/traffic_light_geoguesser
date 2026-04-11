import type { GameMode, Round } from "./types";

type EnvelopeResponse = {
  rounds?: Round[];
  error?: string;
};

export function requestEnvelope(
  fetchImpl: typeof fetch,
  mode: GameMode,
  count?: number,
): Promise<Round[]>;
export function requestEnvelope(fetchImpl: typeof fetch, count?: number): Promise<Round[]>;
export async function requestEnvelope(
  fetchImpl: typeof fetch,
  modeOrCount: GameMode | number | undefined,
  count = 10,
): Promise<Round[]> {
  const mode = typeof modeOrCount === "number" || modeOrCount === undefined ? "global" : modeOrCount;
  const resolvedCount = typeof modeOrCount === "number" ? modeOrCount : count;
  const response = await fetchImpl(`/api/envelope?mode=${mode}&count=${resolvedCount}`, {
    cache: "no-store",
  });

  const payload = (await response.json()) as EnvelopeResponse;

  if (!response.ok || !payload.rounds) {
    throw new Error(payload.error ?? "Failed to load envelope");
  }

  return payload.rounds;
}

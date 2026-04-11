import { NextResponse } from "next/server";

import { loadRoundsForMode, selectEnvelope } from "../../../lib/game/rounds";
import type { GameMode } from "../../../lib/game/types";

export const dynamic = "force-dynamic";

function resolveMode(searchParams: URLSearchParams): GameMode {
  return searchParams.get("mode") === "austin" ? "austin" : "global";
}

function resolveCount(searchParams: URLSearchParams): number {
  const raw = Number(searchParams.get("count") ?? "10");

  if (!Number.isFinite(raw)) {
    return 10;
  }

  return Math.min(50, Math.max(1, Math.floor(raw)));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = resolveMode(url.searchParams);
  const count = resolveCount(url.searchParams);
  const rounds = loadRoundsForMode(mode);

  if (rounds.length === 0) {
    const label = mode === "austin" ? "Austin" : "global";

    return NextResponse.json(
      { error: `No ${label} rounds available` },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    { rounds: selectEnvelope(rounds, count) },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

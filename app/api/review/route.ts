import { NextResponse } from "next/server";

import {
  getPendingCandidates,
  readRawWebcams,
  readReviewMap,
  saveDecision
} from "../../../lib/review/store";

export async function GET() {
  const [records, reviewMap] = await Promise.all([readRawWebcams(), readReviewMap()]);
  const pending = getPendingCandidates(records, reviewMap);

  return NextResponse.json({
    total: records.length,
    reviewed: records.length - pending.length,
    pending
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    id?: string;
    decision?: "approved" | "rejected";
  };

  if (!body.id || (body.decision !== "approved" && body.decision !== "rejected")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await saveDecision(body.id, body.decision);

  return NextResponse.json({ ok: true });
}


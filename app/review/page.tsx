"use client";

import { useEffect, useMemo, useState } from "react";

import type { RawWebcamRecord } from "../../lib/review/store";

type ReviewPayload = {
  total: number;
  reviewed: number;
  pending: RawWebcamRecord[];
};

export default function ReviewPage() {
  const [data, setData] = useState<ReviewPayload | null>(null);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/review", { cache: "no-store" });
      const payload = (await response.json()) as ReviewPayload;
      setData(payload);
      setIndex(0);
    }

    void load();
  }, []);

  const current = useMemo(() => data?.pending[index] ?? null, [data, index]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || saving || !current) return;
      if (event.key.toLowerCase() === "a") {
        void handleDecision("approved");
      }
      if (event.key.toLowerCase() === "x") {
        void handleDecision("rejected");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving, current]);

  async function handleDecision(decision: "approved" | "rejected") {
    if (!current) return;

    setSaving(true);
    await fetch("/api/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: current.id,
        decision
      })
    });

    setData((previous) => {
      if (!previous) return previous;
      const nextPending = previous.pending.filter((record) => record.id !== current.id);
      return {
        total: previous.total,
        reviewed: previous.reviewed + 1,
        pending: nextPending
      };
    });
    setIndex(0);
    setSaving(false);
  }

  if (!data) {
    return <main className="review-shell">Loading review queue...</main>;
  }

  if (!current) {
    return (
      <main className="review-shell">
        <section className="review-card">
          <p className="review-kicker">Review complete</p>
          <h1>No pending webcam images</h1>
          <p>Approved or rejected all downloaded candidates.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="review-shell">
      <section className="review-card">
        <div className="review-header">
          <div>
            <p className="review-kicker">Traffic Cam Review</p>
            <h1>{current.title}</h1>
          </div>
          <p className="review-progress">
            {data.reviewed + 1} / {data.total}
          </p>
        </div>

        <img className="review-image" src={current.imagePath} alt={current.title} />

        <div className="review-meta">
          <p>
            {current.city}, {current.country}
          </p>
          <p>
            {current.lat}, {current.lng}
          </p>
          <p>
            brightness {current.scores?.brightness.toFixed(1) ?? "n/a"} | contrast{" "}
            {current.scores?.contrast.toFixed(1) ?? "n/a"} | edges{" "}
            {current.scores?.edgeDensity.toFixed(3) ?? "n/a"}
          </p>
        </div>

        <div className="review-actions">
          <button
            className="approve-button"
            disabled={saving}
            onClick={() => void handleDecision("approved")}
          >
            ✓ Use image
          </button>
          <button
            className="reject-button"
            disabled={saving}
            onClick={() => void handleDecision("rejected")}
          >
            ✕ Reject image
          </button>
        </div>

        <p className="review-shortcuts">Keyboard: A = approve, X = reject</p>
      </section>
    </main>
  );
}


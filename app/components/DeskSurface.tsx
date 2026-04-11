"use client";

import type { ReactNode } from "react";

/**
 * Messy operator desk surface with wood grain, scattered papers,
 * sticky notes, coffee stains, crumbs, and the occasional cockroach.
 */
export default function DeskSurface({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: `
          repeating-linear-gradient(88deg, transparent, transparent 2px, rgba(80,55,25,0.07) 2px, rgba(80,55,25,0.07) 4px),
          repeating-linear-gradient(91deg, transparent, transparent 8px, rgba(60,40,15,0.04) 8px, rgba(60,40,15,0.04) 12px),
          repeating-linear-gradient(1deg, transparent, transparent 60px, rgba(100,70,30,0.05) 60px, rgba(100,70,30,0.05) 61px),
          radial-gradient(ellipse at 20% 50%, rgba(60,42,18,0.3) 0%, transparent 70%),
          radial-gradient(ellipse at 80% 30%, rgba(50,35,15,0.2) 0%, transparent 60%),
          linear-gradient(90deg, #1e1508 0%, #2a1c10 12%, #302013 30%, #352418 50%, #302013 70%, #2a1c10 88%, #1e1508 100%)
        `,
      }}
    >
      {/* ── STICKY NOTES ── */}

      {/* Yellow sticky — bottom right */}
      <div style={{
        position: "absolute", bottom: 14, right: 12, width: 72, height: 64,
        background: "linear-gradient(145deg, #d4c44e 0%, #c9b83a 100%)",
        borderRadius: "1px 1px 8px 1px", transform: "rotate(4deg)",
        boxShadow: "2px 3px 8px rgba(0,0,0,0.3)", zIndex: 0, padding: 7,
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 6, color: "rgba(40,30,10,0.55)", lineHeight: 1.7 }}>
          CHECK SECTOR 7<br />RECONFIRM 14:00<br />CALL DISPATCH<br />— URGENT
        </div>
      </div>

      {/* Pink sticky — top left, curled corner */}
      <div style={{
        position: "absolute", top: 18, left: 14, width: 60, height: 54,
        background: "linear-gradient(135deg, #e8a0a0 0%, #d48888 100%)",
        borderRadius: "1px 8px 1px 1px", transform: "rotate(-6deg)",
        boxShadow: "2px 2px 6px rgba(0,0,0,0.25)", zIndex: 0, padding: 6,
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 5.5, color: "rgba(60,20,20,0.5)", lineHeight: 1.6 }}>
          GRID REF:<br />47.3N 8.5E<br />VERIFY AM<br />!!
        </div>
      </div>

      {/* Blue sticky — top right area, overlapping */}
      <div style={{
        position: "absolute", top: 8, right: 50, width: 56, height: 50,
        background: "linear-gradient(140deg, #7eb8d8 0%, #5a9aba 100%)",
        borderRadius: "1px 1px 1px 6px", transform: "rotate(2deg)",
        boxShadow: "1px 2px 5px rgba(0,0,0,0.25)", zIndex: 0, padding: 5,
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 5.5, color: "rgba(10,30,50,0.5)", lineHeight: 1.6 }}>
          ROUTE 14<br />BLOCKED<br />USE ALT 7B
        </div>
      </div>

      {/* Green sticky — left edge, half off */}
      <div style={{
        position: "absolute", top: "55%", left: -16, width: 58, height: 52,
        background: "linear-gradient(130deg, #8ec88e 0%, #6aaa6a 100%)",
        borderRadius: "1px 6px 1px 1px", transform: "rotate(-12deg)",
        boxShadow: "2px 2px 5px rgba(0,0,0,0.2)", zIndex: 0, padding: 5,
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 5.5, color: "rgba(15,40,15,0.5)", lineHeight: 1.6 }}>
          SHIFT 3<br />LOGS DUE<br />BY 18:00
        </div>
      </div>

      {/* ── SCATTERED PAPERS ── */}

      {/* Crumpled receipt / torn paper — bottom left */}
      <div style={{
        position: "absolute", bottom: 30, left: 8, width: 40, height: 65,
        background: "linear-gradient(180deg, #c8c0a8 0%, #b8b098 60%, #c0b8a0 100%)",
        borderRadius: "2px 2px 1px 3px", transform: "rotate(-22deg)",
        boxShadow: "1px 1px 4px rgba(0,0,0,0.2)", zIndex: 0,
        borderBottom: "1px solid rgba(160,140,100,0.3)",
      }}>
        <div style={{ padding: "4px 3px", fontFamily: "var(--font-mono)", fontSize: 4, color: "rgba(60,50,30,0.35)", lineHeight: 1.8 }}>
          RX-0042<br />09:14:22<br />CAM ID<br />1292518<br />STATUS:<br />UNCONF
        </div>
      </div>

      {/* Folded paper corner — top center-right */}
      <div style={{
        position: "absolute", top: -4, right: "30%", width: 35, height: 28,
        background: "#c0b898", transform: "rotate(8deg)",
        boxShadow: "1px 1px 3px rgba(0,0,0,0.15)", zIndex: 0,
        clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
      }} />

      {/* Small torn scrap — middle right */}
      <div style={{
        position: "absolute", top: "40%", right: 6, width: 28, height: 18,
        background: "#d0c8b0", transform: "rotate(15deg)",
        boxShadow: "1px 1px 3px rgba(0,0,0,0.15)", zIndex: 0,
        borderRadius: "1px 0 2px 0",
      }} />

      {/* ── COFFEE STAINS ── */}

      {/* Big ring stain — upper right */}
      <div style={{
        position: "absolute", top: 55, right: 20, width: 58, height: 58,
        borderRadius: "50%", border: "3px solid rgba(80,55,25,0.12)",
        background: "radial-gradient(circle, rgba(60,40,15,0.05) 55%, transparent 70%)",
        zIndex: 0,
      }} />

      {/* Small drip stain — center left */}
      <div style={{
        position: "absolute", top: "48%", left: 45, width: 14, height: 18,
        borderRadius: "50%", background: "rgba(70,50,20,0.08)",
        transform: "rotate(20deg)", zIndex: 0,
      }} />

      {/* Tiny splatter dots */}
      {[
        { top: "30%", left: "15%", size: 4 },
        { top: "72%", left: "65%", size: 3 },
        { top: "25%", left: "70%", size: 5 },
        { top: "80%", left: "20%", size: 3 },
        { top: "15%", left: "45%", size: 4 },
      ].map((dot, i) => (
        <div key={`splat-${i}`} style={{
          position: "absolute", top: dot.top, left: dot.left,
          width: dot.size, height: dot.size, borderRadius: "50%",
          background: "rgba(70,50,20,0.07)", zIndex: 0,
        }} />
      ))}

      {/* ── CRUMBS ── */}
      {[
        { top: "35%", left: "80%", size: 3, rot: 0 },
        { top: "62%", left: "12%", size: 2, rot: 45 },
        { top: "70%", left: "75%", size: 4, rot: 20 },
        { top: "20%", left: "25%", size: 2, rot: 70 },
        { top: "85%", left: "55%", size: 3, rot: 10 },
        { top: "45%", left: "88%", size: 2, rot: 35 },
        { top: "55%", left: "8%", size: 3, rot: 60 },
      ].map((c, i) => (
        <div key={`crumb-${i}`} style={{
          position: "absolute", top: c.top, left: c.left,
          width: c.size, height: c.size * 0.7,
          background: "rgba(140,110,60,0.15)",
          borderRadius: "40% 60% 50% 40%",
          transform: `rotate(${c.rot}deg)`, zIndex: 0,
        }} />
      ))}

      {/* ── SCRATCH / WEAR MARKS on wood ── */}
      <div style={{
        position: "absolute", top: "60%", left: "20%", width: 80, height: 1,
        background: "rgba(255,255,255,0.03)", transform: "rotate(-3deg)", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", top: "25%", left: "55%", width: 50, height: 1,
        background: "rgba(255,255,255,0.025)", transform: "rotate(5deg)", zIndex: 0,
      }} />

      {/* ── COCKROACHES ── */}

      {/* Roach 1 — scurries across bottom */}
      <div className="roach roach-1" style={{ zIndex: 0 }}>
        <div className="roach-body" />
      </div>

      {/* Roach 2 — darts from right edge */}
      <div className="roach roach-2" style={{ zIndex: 0 }}>
        <div className="roach-body" />
      </div>

      {/* Main content */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        {children}
      </div>
    </div>
  );
}

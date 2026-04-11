"use client";

import type { ReactNode } from "react";

/**
 * Desk surface with wood grain texture and scattered desk items.
 * Wraps the photo panel content to create the operator-desk feel.
 */
export default function DeskSurface({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        /* Rich wood grain */
        background: `
          repeating-linear-gradient(
            88deg,
            transparent,
            transparent 2px,
            rgba(80, 55, 25, 0.07) 2px,
            rgba(80, 55, 25, 0.07) 4px
          ),
          repeating-linear-gradient(
            91deg,
            transparent,
            transparent 8px,
            rgba(60, 40, 15, 0.04) 8px,
            rgba(60, 40, 15, 0.04) 12px
          ),
          repeating-linear-gradient(
            1deg,
            transparent,
            transparent 60px,
            rgba(100, 70, 30, 0.05) 60px,
            rgba(100, 70, 30, 0.05) 61px
          ),
          radial-gradient(ellipse at 20% 50%, rgba(60, 42, 18, 0.3) 0%, transparent 70%),
          radial-gradient(ellipse at 80% 30%, rgba(50, 35, 15, 0.2) 0%, transparent 60%),
          linear-gradient(
            90deg,
            #1e1508 0%,
            #2a1c10 12%,
            #302013 30%,
            #352418 50%,
            #302013 70%,
            #2a1c10 88%,
            #1e1508 100%
          )
        `,
      }}
    >
      {/* ── Desk items (decorative, behind the photo) ── */}

      {/* Coffee mug ring stain — top right */}
      <div
        style={{
          position: "absolute",
          top: 28,
          right: 32,
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "3px solid rgba(90, 65, 30, 0.15)",
          background: "radial-gradient(circle, rgba(70, 50, 20, 0.06) 60%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* Pen — bottom left, angled */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 20,
          width: 120,
          height: 6,
          background: "linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 80%, #c4a862 85%, #c4a862 90%, #2a2a2a 92%, #1a1a1a 100%)",
          borderRadius: 3,
          transform: "rotate(-15deg)",
          boxShadow: "1px 2px 4px rgba(0,0,0,0.3)",
          zIndex: 0,
        }}
      />
      {/* Pen tip */}
      <div
        style={{
          position: "absolute",
          bottom: 27,
          left: 132,
          width: 0,
          height: 0,
          borderLeft: "4px solid #2a2a2a",
          borderTop: "2px solid transparent",
          borderBottom: "2px solid transparent",
          transform: "rotate(-15deg)",
          zIndex: 0,
        }}
      />

      {/* Paper clip — top left */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 24,
          width: 10,
          height: 28,
          borderRadius: "5px 5px 0 0",
          border: "2px solid rgba(180, 170, 150, 0.3)",
          borderBottom: "none",
          transform: "rotate(12deg)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 68,
          left: 27,
          width: 6,
          height: 18,
          borderRadius: "3px 3px 0 0",
          border: "1.5px solid rgba(180, 170, 150, 0.25)",
          borderBottom: "none",
          transform: "rotate(12deg)",
          zIndex: 0,
        }}
      />

      {/* Second paper clip — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          right: 28,
          width: 10,
          height: 28,
          borderRadius: "5px 5px 0 0",
          border: "2px solid rgba(180, 170, 150, 0.25)",
          borderBottom: "none",
          transform: "rotate(-20deg)",
          zIndex: 0,
        }}
      />

      {/* Sticky note — bottom right corner */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          width: 64,
          height: 58,
          background: "linear-gradient(135deg, #c9b94e 0%, #bfad3a 100%)",
          borderRadius: "1px 1px 6px 1px",
          transform: "rotate(3deg)",
          boxShadow: "2px 2px 6px rgba(0,0,0,0.25)",
          zIndex: 0,
          padding: 6,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 6,
            color: "rgba(40, 30, 10, 0.5)",
            lineHeight: 1.6,
          }}
        >
          CHECK SECTOR 7<br />
          RECONFIRM 14:00<br />
          CALL DISPATCH
        </div>
      </div>

      {/* Red stamp pad — top area, partially visible */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(80px) rotate(-4deg)",
          width: 48,
          height: 32,
          background: "linear-gradient(180deg, #2a1515 0%, #1a0e0e 100%)",
          borderRadius: 3,
          border: "1px solid #3a2020",
          boxShadow: "1px 2px 4px rgba(0,0,0,0.3)",
          zIndex: 0,
        }}
      >
        <div
          style={{
            margin: 4,
            height: "calc(100% - 8px)",
            background: "linear-gradient(180deg, #6b1515 0%, #4a0e0e 100%)",
            borderRadius: 2,
          }}
        />
      </div>

      {/* Faint ruled notepad edge — left edge */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: 0,
          width: 12,
          height: 100,
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 9px,
              rgba(100, 140, 180, 0.08) 9px,
              rgba(100, 140, 180, 0.08) 10px
            ),
            linear-gradient(90deg, #c9c0a8 0%, #c0b898 100%)
          `,
          borderRadius: "0 2px 2px 0",
          boxShadow: "1px 0 3px rgba(0,0,0,0.15)",
          zIndex: 0,
        }}
      />

      {/* Main content (photo) — sits above desk items */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        {children}
      </div>
    </div>
  );
}

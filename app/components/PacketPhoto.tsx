"use client";

export type PacketPhotoProps = {
  imageSrc: string;
  packetId: string;
};

export default function PacketPhoto({ imageSrc, packetId }: PacketPhotoProps) {
  const shortId = packetId.replace(/\D/g, "").slice(-4).padStart(4, "0");

  return (
    <div className="manila" style={{ maxWidth: 380, width: "100%" }}>
      <div
        style={{
          padding: "8px 10px 4px",
          fontSize: 11,
          color: "#3d2e1a",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 700 }}>PKT-{shortId}</span>
        <span style={{ color: "var(--manila-dark)" }}>PRIORITY</span>
      </div>

      <div
        style={{
          background: "var(--desk)",
          margin: "0 6px 6px",
          padding: 8,
          borderRadius: 2,
        }}
      >
        <div style={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
          <img
            src={imageSrc}
            alt="Traffic camera photo"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              filter: "sepia(0.15) contrast(1.05)",
              borderRadius: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(194,168,98,0.03) 2px, rgba(194,168,98,0.03) 4px)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      <div style={{ padding: "4px 10px 8px", textAlign: "right" }}>
        <span className="stamp stamp-danger" style={{ fontSize: 10 }}>
          UNVERIFIED
        </span>
      </div>
    </div>
  );
}

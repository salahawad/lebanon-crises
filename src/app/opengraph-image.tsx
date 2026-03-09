import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lebanon Relief — Humanitarian Coordination";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top red stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "#EE161F",
            display: "flex",
          }}
        />
        {/* Bottom red stripe */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "#EE161F",
            display: "flex",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            marginBottom: 12,
            display: "flex",
          }}
        >
          Lebanon Relief
        </div>

        {/* Arabic title */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "rgba(255,255,255,0.8)",
            marginBottom: 24,
            display: "flex",
          }}
        >
          إغاثة لبنان
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          Connecting displaced people with volunteers and organizations who can help
        </div>

        {/* Bottom icons */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
            fontSize: 36,
          }}
        >
          <span>🆘</span>
          <span>🤝</span>
          <span>📞</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

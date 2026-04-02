import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e1e1e",
          borderRadius: 36,
        }}
      >
        <span
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: "#1fbda6",
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1,
          }}
        >
          H
        </span>
      </div>
    ),
    { ...size }
  );
}

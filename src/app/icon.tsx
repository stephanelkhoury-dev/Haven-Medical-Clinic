import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e1e1e",
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontSize: 20,
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

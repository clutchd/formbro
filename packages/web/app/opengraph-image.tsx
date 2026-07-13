import { APP_DESCRIPTION, APP_NAME } from "@formbro/shared/brand";
import { ImageResponse } from "next/og";

export const alt = `${APP_NAME} — serious forms without the enterprise tax`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#f7f5ef",
        color: "#171717",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        {APP_NAME}
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
        <div
          style={{
            border: "2px solid #171717",
            display: "flex",
            fontSize: 18,
            letterSpacing: "0.12em",
            marginBottom: 28,
            padding: "8px 12px",
            textTransform: "uppercase",
            width: "fit-content",
          }}
        >
          Open-source form workflows
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.055em",
            lineHeight: 0.98,
          }}
        >
          Serious forms without the enterprise tax.
        </div>
        <div
          style={{
            color: "#5f5b55",
            display: "flex",
            fontSize: 25,
            lineHeight: 1.4,
            marginTop: 24,
            maxWidth: 820,
          }}
        >
          {APP_DESCRIPTION}
        </div>
      </div>
      <div style={{ background: "#171717", display: "flex", height: 10, width: "100%" }} />
    </div>,
    size,
  );
}

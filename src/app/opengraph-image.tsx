import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "#FBF7F0",
        borderTop: "24px solid #1F5C4A",
        color: "#1F5C4A",
      }}
    >
      <div style={{ fontSize: 76, fontWeight: 700 }}>Coverage Keeper</div>
      <div
        style={{
          marginTop: 28,
          fontSize: 38,
          lineHeight: 1.35,
          color: "#1F2A24",
          maxWidth: 980,
        }}
      >
        {SITE_DESCRIPTION}
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 30,
          background: "#FFD166",
          color: "#1F2A24",
          padding: "8px 16px",
          alignSelf: "flex-start",
        }}
      >
        Free · No sign-up · We don&apos;t save your photo
      </div>
    </div>,
    size,
  );
}

import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/shared/seo/site";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #0f0f12 0%, #1a1a24 45%, #2b1b3d 100%)",
          color: "#ffffff",
          padding: "72px"
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#c4b5fd",
            marginBottom: 24
          }}
        >
          Онлайн-кинотеатр
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: 28
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 34,
            lineHeight: 1.4,
            maxWidth: 760,
            color: "#d4d4d8"
          }}
        >
          Фильмы и сериалы онлайн с HLS-плеером и совместным просмотром
        </div>
      </div>
    ),
    size
  );
}

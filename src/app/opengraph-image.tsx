import {ImageResponse} from "next/og";

export const runtime = "edge";

export const alt = "Teancy";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, rgba(200,200,200,0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(200,200,200,0.1) 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          color: "#fafafa",
        }}
      >
        <span style={{fontSize: 256, height: 256, marginTop: -100}}>🤝</span>
        <div style={{marginTop: 32, fontSize: 80, fontWeight: "bold"}}>Teancy</div>
        <div style={{marginTop: 6, fontSize: 36, fontWeight: "normal"}}>
          Create balanced teams for all things
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

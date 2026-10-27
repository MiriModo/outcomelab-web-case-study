import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { home, site } from "@/content/site";

export const alt = `${site.name}. ${home.hero.title}.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The image for link previews (1200x630): white background, the logo, the
 * hero headline and the markets. It's generated at build time from the
 * logo SVG and the same self-hosted Archivo font the site uses.
 */
export default async function OpenGraphImage() {
  const [archivo, logo] = await Promise.all([
    readFile(join(process.cwd(), "src/fonts/archivo-latin-600-normal.woff")),
    readFile(join(process.cwd(), "public/brand/outcome-lab-logo-horizontal-gradient-light-bg.svg")),
  ]);
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          color: "#0A0A0A",
          padding: "64px 80px 56px",
          fontFamily: "Archivo",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
        <img src={logoSrc} width={274} height={60} alt="" />

        <div
          style={{
            display: "flex",
            fontSize: 124,
            lineHeight: 0.98,
            letterSpacing: "-0.045em",
            maxWidth: 960,
          }}
        >
          {`${home.hero.title}.`}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #EEEEEC",
            paddingTop: 22,
            fontSize: 20,
            color: "#6E6E6C",
          }}
        >
          <span>{site.markets.join(" · ")}</span>
          <span>{site.domain}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Archivo", data: archivo, weight: 600, style: "normal" }],
    },
  );
}

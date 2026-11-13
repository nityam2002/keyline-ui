import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { DOC_PAGES } from "@site/lib/docs-markdown";
import { installCommand } from "@site/lib/registry";
import { SITE_NAME } from "@site/lib/seo";
import { siteFile } from "@site/lib/source";

/**
 * Each docs page's share image (1200×630), drawn at build: the page's name in a square Keyline frame, its group,
 * and for a component the install command, in cells on the frame's seams (drift-ui and ballmac print the command
 * too). pageMetadata points a docs page's openGraph and twitter images here. IBM Plex Mono is the face: the image
 * renderer reads WOFF, and Atkinson ships only WOFF2.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return DOC_PAGES.map((p) => ({ slug: p.href.slice(1).split("/") }));
}

// the light theme's resolved colours, as scripts/og-image.mjs draws the site's own share image
const C = { paper: "#f0f0f3", cell: "#ffffff", ink: "#14151a", ink2: "#4a4c55", seam: "#c4c5cc", cobalt: "#1d4ed8" };

const font = (weight: number) =>
  fs.readFileSync(
    path.join(
      /*turbopackIgnore: true*/ siteFile("app"),
      "../../node_modules/@fontsource/ibm-plex-mono/files",
      `ibm-plex-mono-latin-${weight}-normal.woff`,
    ),
  );

export async function GET(_: Request, ctx: RouteContext<"/og/[...slug]">) {
  const href = `/${(await ctx.params).slug.join("/")}`;
  const page = DOC_PAGES.find((p) => p.href === href)!;
  const command = page.item ? installCommand(page.item) : `${SITE_NAME} · docs`;
  const cell = { display: "flex", alignItems: "center", padding: "0 36px" } as const;

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", padding: 40, background: C.paper }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          border: `6px solid ${C.ink}`,
          background: C.cell,
          color: C.ink,
          fontFamily: "Plex Mono",
        }}
      >
        <div style={{ ...cell, height: 88, borderBottom: `2px solid ${C.seam}`, fontSize: 28, fontWeight: 700 }}>
          <div style={{ display: "flex", flex: 1 }}>{SITE_NAME}</div>
          <div style={{ display: "flex", color: C.ink2, fontWeight: 400 }}>{page.group}</div>
        </div>
        <div style={{ ...cell, flex: 1, fontSize: page.name.length > 18 ? 76 : 104, fontWeight: 700 }}>{page.name}</div>
        <div
          style={{
            ...cell,
            height: 96,
            borderTop: `6px solid ${C.ink}`,
            fontSize: command.length > 46 ? 24 : 30,
            color: page.item ? C.cobalt : C.ink2,
          }}
        >
          {command}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Plex Mono", data: font(400), weight: 400, style: "normal" },
        { name: "Plex Mono", data: font(700), weight: 700, style: "normal" },
      ],
    },
  );
}

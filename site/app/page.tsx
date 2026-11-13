import { HomeInstall } from "@site/components/home-install";
import { ORIGIN_SLOT, registryAddCommand } from "@site/lib/registry";
import { HomeSpecimen } from "@site/components/home-specimen";
import { PrimaryLink } from "@site/components/primary-link";
import { Land, CropMarks, Mark } from "@site/components/land";
import { WRITTEN } from "@site/lib/catalog";
import { SiteControls } from "@site/components/site-controls";
import { pageMetadata, SITE_DESCRIPTION, websiteJsonLd } from "@site/lib/seo";

export const metadata = pageMetadata({
  title: "Keyline UI · React components for dense interfaces",
  description: SITE_DESCRIPTION,
  path: "/",
  absolute: true,
});

/* Sheet 1. The page is drawn as one sheet: a printer's keyline around it, the land of widths inside it
   (a keyline through the keypoint), and a title block where a header bar would be. */
export default function Home() {
  return (
    <main id="main" className="s-sheet s-home">
      {/* the site's name and address for search results; "<" escaped so the JSON can't close the script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()).replace(/</g, "\\u003c") }}
      />
      <CropMarks />
      <div className="s-frame">
        <Land />
        {/* data-ghost: the heading's cobalt plate, printed under it and stepped into register (site.css: Register) */}
        <h1 className="s-title" data-ghost="Controls that fit together.">
          Controls that fit together.
        </h1>
        <SiteControls className="s-site-ctl" />
        <HomeSpecimen
          identity={
            <>
              <p className="s-mark">
                <Mark />
                Keyline UI
              </p>
              <p className="m-0 text-[15px]/[1.5] text-pretty text-kl-ink-2">
                React components for dense, work-heavy interfaces. Toolbars, tables and menus share one frame, its seams
                and its cells, and keep working when the space runs out. You install their source with the shadcn CLI.
              </p>
              <p className="m-0 mt-auto font-kl-mono text-[12px] text-kl-ink-3">
                Sheet 1 of {WRITTEN.length + 1} · Built on Base UI
              </p>
            </>
          }
          actions={
            <>
              <PrimaryLink href="/docs/installation">Get started</PrimaryLink>
              <HomeInstall
                map={registryAddCommand()}
                add="npx shadcn@latest add @keyline-ui/<name>"
                slot={ORIGIN_SLOT}
              />
            </>
          }
        />
      </div>
    </main>
  );
}

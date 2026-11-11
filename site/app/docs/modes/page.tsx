import { pageDescription } from "@site/lib/catalog"
import { pageMetadata } from "@site/lib/seo"
import Link from "next/link"
import { CodeBlock } from "@site/components/code-block"
import { ComponentDemo } from "@site/components/component-demo"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { ReferenceTable, type ReferenceRow } from "@site/components/reference-table"
import { ModesRegion } from "@site/components/guide-previews"
import { installCommand } from "@site/lib/registry"

export const metadata = pageMetadata({ title: "Modes", description: pageDescription("/docs/modes"), path: "/docs/modes" })

const MODES: ReferenceRow[] = [
  { name: "Theme", value: <><code>.dark</code> · <code>.light</code></>, description: "Any subtree, including a light region inside a dark page." },
  { name: "Density", value: <code>data-kl-density=&quot;compact&quot; | &quot;default&quot; | &quot;comfortable&quot;</code>, description: "Any subtree." },
  { name: "Cut", value: <><code>data-kl-cut=&quot;off&quot; | &quot;quiet&quot; | &quot;on&quot;</code>, or <code>--kl-cut</code></>, description: <><code>:root</code> or any subtree.</> },
  { name: "Reduced motion", value: <code>data-kl-motion=&quot;reduce&quot;</code>, description: <>Any subtree. <code>prefers-reduced-motion</code> is honoured anyway.</> },
  { name: "Direction", value: <><code>dir=&quot;rtl&quot;</code>, or <code>DirectionProvider</code></>, description: "Any subtree." },
]

const DENSITY: ReferenceRow[] = [
  { name: <code>compact</code>, value: "28 · 28 · 8 · 12 · 13px", description: "Dense tools: tables with many rows, inspectors, admin screens." },
  { name: <code>default</code>, value: "36 · 40 · 12 · 12 · 14px", description: "What you get without the attribute." },
  { name: <code>comfortable</code>, value: "40 · 48 · 16 · 16 · 15px", description: "Touch-first screens and forms read at a distance." },
]

const DARK = `<html className="dark">          {/* next-themes with attribute="class" sets this for you */}
  …
  <section className="light">…</section>   {/* a light region inside the dark page */}
</html>`

const REGION = `<div className="dark" data-kl-density="compact" data-kl-cut="quiet" data-kl-motion="reduce">
  …
</div>`

const RTL = `import { DirectionProvider } from "@/components/keyline/ui/direction"

<DirectionProvider direction="rtl" lang="ar">
  …
</DirectionProvider>`

const MOTION = `/* turn off the press tug and the flood seed in one region */
.my-table-region {
  --kl-stretch-tug: 0;
  --kl-flood-seed: 0px;
}`

const TOC: TocGroup[] = [
  { label: "Modes", items: [{ id: "overview", label: "Overview" }, { id: "dark", label: "Dark mode" }, { id: "density", label: "Density" }, { id: "cut", label: "Cut" }, { id: "rtl", label: "Right to left" }, { id: "motion", label: "Reduced motion" }] },
  { label: "Regions", items: [{ id: "regions", label: "A mode for one region" }] },
]

export default function ModesPage() {
  return (
    <DocPage name="Modes" toc={TOC}>
      <h1>Modes</h1>
      <p className="s-doc-lede">
        Theme, density, the cut, motion and direction are classes or attributes. Set one on <code>&lt;html&gt;</code> for the whole app, or on any element for
        the region inside it. Menus and popups opened from that region follow it.
      </p>

      <ComponentDemo label="Modes example" preview={<ModesRegion />} code={<ExampleCode file="modes-region.tsx" label="example code" />} />

      <h2 id="overview">Overview</h2>
      <ReferenceTable label="Modes" head={["To set", "Use", "Where"]} rows={MODES} />
      <p className="s-small">
        Modes change how Keyline is tuned, not what it is: border weights, square corners and the signal colours&apos; jobs stay the same in every mode.
      </p>

      <h2 id="dark">Dark mode</h2>
      <p>
        Keyline follows a <code>.dark</code> or <code>.light</code> class on an ancestor. It does not read <code>prefers-color-scheme</code> itself. shadcn&apos;s
        dark-mode setups (next-themes with <code>attribute=&quot;class&quot;</code>, or its Vite theme provider) already set that class, so nothing else is
        needed.
      </p>
      <CodeBlock code={DARK} lang="tsx" copyLabel="dark mode" />
      <p>
        Dark is tuned, not mirrored. Surfaces lift off black, primary text stops short of white, edges step down in tone by role, and the inverse fill is a
        light grey rather than white.
      </p>

      <h2 id="density">Density</h2>
      <p>
        Density sets control height, row height, inset, gutter, base type size and the cut&apos;s sizes. It never changes border weights. The figures below are
        control height · row height · inset · gutter · type size.
      </p>
      <ReferenceTable label="Densities" head={["Density", "Sizes", "For"]} rows={DENSITY} />
      <p className="s-small">
        Each density states all of its sizes, so a compact region inside a comfortable page does not inherit the page&apos;s 16px gutter.
      </p>

      <h2 id="cut">Cut</h2>
      <p>
        The cut is an optional diagonal accent on frames and controls, off by default. <code>data-kl-cut</code> sets it for a region, or set{" "}
        <code>--kl-cut</code> directly: <code>0</code> off, <code>0.5</code> quiet, <code>1</code> full.
      </p>
      <p className="s-small">
        Outside Chromium the cut is drawn with <code>clip-path</code>, and a focus outline stops at the diagonal instead of following it.
      </p>

      <h2 id="rtl">Right to left</h2>
      <p>
        Keyline&apos;s CSS and its components that read layout from the DOM (Toolbar, Slider, Scroll Area, Carousel) follow the DOM&apos;s <code>dir</code>. Base
        UI decides which side a tooltip, popover, hover card or menu opens on, and which way its arrow keys go, from its own provider.{" "}
        <Link href="/docs/components/direction">DirectionProvider</Link> sets both and adds no box:
      </p>
      <CodeBlock code={installCommand("direction")} lang="bash" copyLabel="install command" />
      <CodeBlock code={RTL} lang="tsx" copyLabel="direction usage" />

      <h2 id="motion">Reduced motion</h2>
      <p>
        <code>data-kl-motion=&quot;reduce&quot;</code> on a region, or <code>prefers-reduced-motion: reduce</code> in the reader&apos;s system, sets every motion
        duration to zero. State still changes, at once: a band jumps instead of stretching, a panel opens without unfolding.
      </p>
      <p>
        Timings are tokens too (<code>--kl-t-flood</code>, <code>--kl-t-unfold</code>, <code>--kl-stretch-lead</code>, …), and two set a behaviour you can
        turn off for one region:
      </p>
      <CodeBlock code={MOTION} lang="css" copyLabel="motion tokens" />

      <h2 id="regions">A mode for one region</h2>
      <p>
        Every mode composes on one element. Overlays opened from inside the region (select lists, menus, popovers, dialogs, tooltips, toasts) render under{" "}
        <code>&lt;body&gt;</code> but carry the region&apos;s theme, density, motion, direction and tokens with them. There is no provider to add.
      </p>
      <CodeBlock code={REGION} lang="tsx" copyLabel="region modes" />
      <p>
        To change the palette or fonts of a region as well, make it a configuration scope (see <Link href="/docs/configuration">Configuration</Link>).
      </p>
    </DocPage>
  )
}

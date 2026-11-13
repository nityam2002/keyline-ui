import { pageDescription } from "@site/lib/catalog";
import { pageMetadata } from "@site/lib/seo";
import Link from "next/link";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { ReferenceTable, type ReferenceRow } from "@site/components/reference-table";
import { ThemingRoles } from "@site/components/guide-previews";
import { installCommand } from "@site/lib/registry";
import { CUT_DEFAULT, PALETTE, TEXT, TYPE as FACES } from "@/components/keyline/theme/tokens";

export const metadata = pageMetadata({
  title: "Theming",
  description: pageDescription("/docs/theming"),
  path: "/docs/theming",
});

const TOKENS: ReferenceRow[] = [
  {
    name: <code>--kl-working</code>,
    value: <code>{PALETTE.working}</code>,
    description: "The working set: selection, tokens, ranges.",
  },
  {
    name: <code>--kl-commit</code>,
    value: <code>{PALETTE.commit}</code>,
    description: "Location and commitment: the current place, the primary action, focus.",
  },
  {
    name: <code>--kl-attention</code>,
    value: <code>{PALETTE.attention}</code>,
    description: "Invalid, failed, destructive, overdue.",
  },
  {
    name: <code>--kl-neutral-h</code>,
    value: <code>{PALETTE.neutralHue}</code>,
    description: "The hue of paper, ink and keylines.",
  },
  {
    name: <code>--kl-neutral-c</code>,
    value: <code>{PALETTE.neutralTint}</code>,
    description: (
      <>
        How tinted the neutrals are: <code>0</code> is grey, <code>1</code> the default, up to <code>3</code>.
      </>
    ),
  },
  { name: <code>--kl-font</code>, value: <code>Atkinson Hyperlegible Next</code>, description: "The UI voice." },
  {
    name: <code>--kl-font-mono</code>,
    value: <code>Atkinson Hyperlegible Mono</code>,
    description: "The Code voice: units, IDs, numbers in tables.",
  },
  {
    name: <code>--kl-weight-strong</code>,
    value: <code>{FACES.strong}</code>,
    description: "Labels, table headers and the Count.",
  },
  {
    name: <code>--kl-weight-display</code>,
    value: <code>{FACES.display}</code>,
    description: "Titles and glyph cells.",
  },
  {
    name: <code>--kl-cut</code>,
    value: <code>{CUT_DEFAULT}</code>,
    description: (
      <>
        The cut accent: <code>0</code> off, <code>0.5</code> quiet, <code>1</code> full. See{" "}
        <Link href="/docs/modes#cut">Modes</Link>.
      </>
    ),
  },
];

const ROLES: ReferenceRow[] = [
  {
    name: (
      <>
        <code>paper</code> <code>cell</code> <code>raised</code>
      </>
    ),
    value: <code>bg-kl-cell</code>,
    description: (
      <>
        The page; a panel or control; an overlay. An overlay sets <code>--kl-cell</code> to <code>raised</code>, so
        everything inside lifts with it.
      </>
    ),
  },
  {
    name: (
      <>
        <code>tint</code> <code>press</code>
      </>
    ),
    value: <code>hover:bg-kl-tint</code>,
    description: "Hover and press feedback.",
  },
  {
    name: (
      <>
        <code>ink</code> <code>ink-2</code> <code>ink-3</code>
      </>
    ),
    value: <code>text-kl-ink-2</code>,
    description: "Primary, secondary and supporting text.",
  },
  {
    name: (
      <>
        <code>line</code> <code>seam</code> <code>line-soft</code>
      </>
    ),
    value: <code>border-kl-seam</code>,
    description: "Frames and control edges; the 1px divider between parts of one frame; decorative row rules.",
  },
  {
    name: (
      <>
        <code>inverse</code> <code>on-inverse</code>
      </>
    ),
    value: <code>bg-kl-inverse</code>,
    description: "The ink painted as a fill (a cursor, a checked box) and the text on it.",
  },
  {
    name: (
      <>
        <code>yellow</code> <code>on-yellow</code> <code>yellow-row</code>
      </>
    ),
    value: <code>bg-kl-yellow</code>,
    description: "The working signal, the text on it, and a selected row.",
  },
  {
    name: (
      <>
        <code>cobalt</code> <code>red</code>
      </>
    ),
    value: <code>text-kl-cobalt-text</code>,
    description: (
      <>
        The commit and attention signals, each with <code>on-</code>, <code>-hi</code>, <code>-lo</code> and{" "}
        <code>-text</code> variants (<code>bg-kl-red-lo</code>, <code>text-kl-on-cobalt</code>).
      </>
    ),
  },
  {
    name: <code>focus</code>,
    value: <code>outline-kl-focus</code>,
    description: "Focus indicators: the commit colour's text variant.",
  },
  {
    name: (
      <>
        <code>dis</code> <code>dis-line</code> <code>scrim</code>
      </>
    ),
    value: <code>text-kl-dis</code>,
    description: "Disabled text and edges; the scrim behind a modal.",
  },
  {
    name: (
      <>
        <code>data-1</code> <code>data-2</code> <code>data-3</code>
      </>
    ),
    value: <code>fill-kl-data-1</code>,
    description: (
      <>
        Chart and meter series by role: the focal series, the comparison, the rest. <code>data-mark</code> marks a
        value, <code>data-alert</code> a breach.
      </>
    ),
  },
];

const TYPE: ReferenceRow[] = [
  { name: <code>font-kl</code>, value: <code>font-family</code>, description: "The UI voice." },
  { name: <code>font-kl-mono</code>, value: <code>font-family</code>, description: "The Code voice." },
  {
    name: <code>font-kl-strong</code>,
    value: <code>font-weight</code>,
    description: (
      <>
        The strong weight, <code>--kl-weight-strong</code>.
      </>
    ),
  },
  {
    name: <code>font-kl-display</code>,
    value: <code>font-weight</code>,
    description: (
      <>
        The display weight, <code>--kl-weight-display</code>.
      </>
    ),
  },
  {
    name: (
      <>
        <code>kl-inset</code> <code>kl-gutter</code>
      </>
    ),
    value: <code>spacing</code>,
    description: (
      <>
        The density&apos;s inner padding and gap, with any spacing utility: <code>px-kl-inset</code>,{" "}
        <code>gap-kl-gutter</code>.
      </>
    ),
  },
  {
    name: (
      <>
        <code>kl-ctl</code> <code>kl-row</code>
      </>
    ),
    value: <code>spacing</code>,
    description: (
      <>
        The density&apos;s control height and row height: <code>h-kl-ctl</code>, <code>min-h-kl-row</code>.
      </>
    ),
  },
  {
    name: (
      <>
        <code>kl-k1</code> <code>kl-k2</code> <code>kl-k3</code>
      </>
    ),
    value: <code>spacing</code>,
    description: "The keyline weights (1, 2 and 3px), for offsets that meet a frame's edge.",
  },
  {
    name: (
      <>
        <code>kl-cut-region</code> <code>kl-cut-control</code> <code>kl-cut-nested</code>
      </>
    ),
    value: <code>spacing</code>,
    description: "The cut's size on a region, a control and a nested part, by density.",
  },
  {
    name: (
      <>
        {Object.keys(TEXT.default).map((t) => (
          <code key={t}>text-kl-{t} </code>
        ))}
      </>
    ),
    value: <code>font-size</code>,
    description: (
      <>
        The type scale, by role. At default density:{" "}
        {Object.entries(TEXT.default)
          .map(([t, v]) => `${t} ${v}`)
          .join(", ")}
        . Each size steps with the density.
      </>
    ),
  },
  {
    name: (
      <>
        <code>ease-kl-out</code> <code>ease-kl-in</code>
      </>
    ),
    value: <code>transition-timing-function</code>,
    description: "Keyline's two eases: an entrance and an exit.",
  },
  {
    name: (
      <>
        <code>kl-code</code> <code>kl-count</code>
      </>
    ),
    value: <code>class</code>,
    description: "The two public classes: the Code voice for units and IDs, and the Count voice for big numbers.",
  },
];

const FONTS: ReferenceRow[] = [
  {
    name: "Atkinson Hyperlegible Next and Mono",
    value: "default",
    description: (
      <>
        Comes with <code>@keyline-ui/keyline</code>: two npm packages imported from your stylesheet, bundled with your
        app.
      </>
    ),
  },
  {
    name: "IBM Plex Sans and Mono",
    value: <code>plex</code>,
    description: (
      <>
        <code>@fontsource-variable/ibm-plex-sans</code> and <code>@fontsource/ibm-plex-mono</code>. Plex Sans stops at
        weight 700, so the display weight is held at 700 too.
      </>
    ),
  },
  {
    name: "System UI",
    value: <code>system</code>,
    description: "The platform's own sans and mono. Nothing to install.",
  },
];

const OVERRIDE = `/* your stylesheet: \`shadcn add\` wrote Keyline's defaults into this :root; edit them here */
:root {
  --kl-commit: oklch(0.47 0.12 222);
  --kl-neutral-h: 225;
  --kl-neutral-c: 1.4;
}`;

const UTILITIES = `<div className="border-3 border-kl-line bg-kl-cell text-kl-ink">
  <h3 className="font-kl-strong">Warehouse stock</h3>
  <p className="text-kl-ink-2">412 cases</p>
  <footer className="bg-kl-inverse px-kl-inset text-kl-on-inverse">…</footer>
</div>`;

const PLEX = `npm install @fontsource-variable/ibm-plex-sans @fontsource/ibm-plex-mono`;

const PLEX_CSS = `@import "@fontsource-variable/ibm-plex-sans";
@import "@fontsource/ibm-plex-mono/400.css";
@import "@fontsource/ibm-plex-mono/500.css";

:root {
  --kl-font: "IBM Plex Sans Variable", ui-sans-serif, system-ui, sans-serif;
  --kl-font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --kl-weight-display: 700;
}`;

const SYSTEM_CSS = `:root {
  --kl-font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --kl-font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}`;

const TOC: TocGroup[] = [
  {
    label: "Colour",
    items: [
      { id: "tokens", label: "Source tokens" },
      { id: "derived", label: "Derived colours" },
      { id: "brand", label: "Brand colours" },
      { id: "roles", label: "Colour roles" },
      { id: "utilities", label: "Tailwind utilities" },
    ],
  },
  { label: "Type", items: [{ id: "fonts", label: "Fonts" }] },
  {
    label: "shadcn",
    items: [
      { id: "coexistence", label: "Beside shadcn" },
      { id: "keyline-shadcn", label: "The whole app" },
    ],
  },
];

export default function ThemingPage() {
  return (
    <DocPage name="Theming" toc={TOC}>
      <h1>Theming</h1>
      <p className="s-doc-lede">
        You set ten source tokens; Keyline derives every other colour from them, in both themes. Components pick colours
        by role, not by value, and so can yours: every role is a Tailwind utility.
      </p>

      <ComponentDemo
        label="Role utilities example"
        preview={<ThemingRoles />}
        code={<ExampleCode file="theming-roles.tsx" label="example code" />}
      />

      <h2 id="tokens">Source tokens</h2>
      <p>
        These are the only colour, type and cut values you configure. Installing the <code>keyline</code> item writes
        their defaults into your stylesheet&apos;s own <code>:root</code> and <code>.dark</code>, beside shadcn&apos;s
        tokens: change them there. Adding components never touches them; adding the <code>keyline</code> item again
        resets them to Keyline&apos;s defaults. The cut is the exception: its default sits in <code>@layer base</code>,
        so a <code>--kl-cut</code> of yours wins wherever it is in the file.
      </p>
      <ReferenceTable label="Source tokens" head={["Token", "Default", "Meaning"]} rows={TOKENS} />
      <CodeBlock code={OVERRIDE} lang="css" copyLabel="token override" />
      <p className="s-small">
        Role weights (3, 2 and 1px), square corners, the signal jobs and the motion behaviours are not tokens: they are
        what Keyline is. Motion timings are tokens too, covered in <Link href="/docs/modes#motion">Modes</Link>.
      </p>

      <h2 id="derived">Derived colours</h2>
      <p>
        Fills, foregrounds, text variants, focus, selection, data colours and both themes are computed from the source
        tokens. They are recomputed only on <code>:root</code>, <code>.light</code>, <code>.dark</code> and elements
        with <code>data-kl-config</code>. Set a source token on one of those. On a plain element, a control there keeps
        the old derived colour while a popup opened from it takes the new one.
      </p>
      <p>
        To change the palette of one region, use a configuration scope: <code>data-kl-config</code> by hand, or{" "}
        <code>KeylineConfigScope</code> (see <Link href="/docs/configuration">Configuration</Link>).
      </p>

      <h2 id="brand">Brand colours</h2>
      <p>
        Commit and attention fills get white or dark text by lightness; the crossover is OKLCH L 0.575. A fill picked by
        hand between L 0.5 and 0.65 can fall below 4.5:1 contrast with either. Keep those two fills outside that band,
        or let <code>roleColor</code> pick the lightness for a hue, as the preset palettes do (see{" "}
        <Link href="/docs/configuration#helpers">Configuration</Link>).
      </p>
      <p>
        Keep the three signal hues apart. Commit and attention closer than 40° make a primary action read as a warning;
        the working set within 30° of either merges two signals.
      </p>

      <h2 id="roles">Colour roles</h2>
      <p>
        When you build your own component, pick the role, not a colour. A divider between cells of one frame is{" "}
        <code>seam</code>; a cursor or checked fill is <code>inverse</code> with <code>on-inverse</code> text.
      </p>
      <ReferenceTable label="Colour roles" head={["Role", "Utility", "For"]} rows={ROLES} />

      <h2 id="utilities">Tailwind utilities</h2>
      <p>
        Every role is a Tailwind colour of the same name prefixed <code>kl-</code>, so it works with any colour utility
        (<code>bg-</code>, <code>text-</code>, <code>border-</code>, <code>fill-</code>, <code>outline-</code>) and your
        editor completes it. The utilities follow <code>.dark</code> and configuration scopes like the tokens do, and
        leave shadcn&apos;s <code>bg-primary</code> or <code>border-border</code> alone. Arbitrary values work too:{" "}
        <code>text-(--kl-ink-2)</code>.
      </p>
      <CodeBlock code={UTILITIES} lang="tsx" copyLabel="utilities" />
      <ReferenceTable label="Type and spacing utilities" head={["Utility", "Sets", "For"]} rows={TYPE} />
      <p className="s-small">
        Every other <code>kl-</code> class is internal and can change between versions. If a composition seems to need
        one, that is a gap to report (see <Link href="/docs/composition#public-api">Composition</Link>).
      </p>

      <h2 id="fonts">Fonts</h2>
      <p>
        Keyline has two voices, UI and Code, set by <code>--kl-font</code> and <code>--kl-font-mono</code>. Atkinson
        Hyperlegible is the default; IBM Plex and the system fonts are tested alternatives.
      </p>
      <ReferenceTable label="Fonts" head={["Font", "Config value", "Installs"]} rows={FONTS} />
      <h3 id="plex">IBM Plex</h3>
      <p>Install the packages, then import them and point the tokens at them:</p>
      <CodeBlock code={PLEX} lang="bash" copyLabel="font install command" />
      <CodeBlock code={PLEX_CSS} lang="css" copyLabel="Plex tokens" />
      <h3 id="system">System fonts</h3>
      <CodeBlock code={SYSTEM_CSS} lang="css" copyLabel="system font tokens" />
      <p className="s-small">
        <code>configToCss</code> writes these lines for a configuration (see{" "}
        <Link href="/docs/configuration#whole-app">Configuration</Link>). The Atkinson packages stay imported after a
        switch; remove their <code>@import</code> lines yourself if you no longer want them.
      </p>

      <h2 id="coexistence">Beside shadcn</h2>
      <p>
        Keyline&apos;s CSS writes only its own names: <code>--kl-*</code> tokens, <code>kl-</code> classes and{" "}
        <code>data-kl-*</code> attributes. It sets no <code>body</code> styles, no shadcn tokens, no{" "}
        <code>--radius</code>, no <code>--font-sans</code> and no global focus ring, so stock shadcn components on the
        same page look as they did. Keyline&apos;s files go to <code>components/keyline/</code>, so its{" "}
        <code>Button</code> and shadcn&apos;s <code>Button</code> can both be imported.
      </p>
      <p>
        Each outermost Keyline element sets Keyline&apos;s font and ink itself, so a component keeps its voice inside an
        app that uses another font.
      </p>

      <h2 id="keyline-shadcn">The whole app in Keyline</h2>
      <p>To give stock shadcn components Keyline&apos;s look too, add the opt-in theme:</p>
      <CodeBlock code={installCommand("keyline-shadcn")} lang="bash" copyLabel="whole-app theme command" />
      <p>
        It maps shadcn&apos;s semantic colour tokens, sidebar tokens included, to Keyline roles in <code>:root</code>,{" "}
        <code>.light</code>, <code>.dark</code> and configuration scopes. It also sets <code>--radius: 0px</code>,
        points <code>--font-sans</code> and <code>--font-mono</code> at Keyline&apos;s fonts, styles <code>body</code>,
        adds a <code>:focus-visible</code> ring and sets <code>color-scheme</code> per theme. <code>--popover</code>{" "}
        becomes <code>raised</code>, <code>--border</code> <code>seam</code>, <code>--input</code> <code>line</code> and{" "}
        <code>--ring</code> <code>focus</code>. <code>--chart-*</code> is left to you: Keyline&apos;s data colours are
        roles, not a series.
      </p>
      <p className="s-small">
        Because it restyles <code>body</code> and shadcn&apos;s tokens, add it only when the whole app should be
        Keyline. Removing it means deleting those rules from your stylesheet; the CLI does not remove CSS.
      </p>
    </DocPage>
  );
}

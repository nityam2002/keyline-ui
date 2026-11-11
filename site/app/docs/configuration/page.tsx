import { pageDescription } from "@site/lib/catalog"
import { pageMetadata } from "@site/lib/seo"
import Link from "next/link"
import { CodeBlock } from "@site/components/code-block"
import { ComponentDemo } from "@site/components/component-demo"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { ReferenceTable, type ReferenceRow } from "@site/components/reference-table"
import { ConfigScope } from "@site/components/guide-previews"
import { installCommand } from "@site/lib/registry"

export const metadata = pageMetadata({ title: "Configuration", description: pageDescription("/docs/configuration"), path: "/docs/configuration" })

const SHAPE = `type KeylineConfig = {
  palette: {
    working: string      // oklch(), the working set
    commit: string       // oklch(), location and commitment
    attention: string    // oklch(), invalid, failed, destructive
    neutralHue: number   // 0–360
    neutralTint: number  // 0–3
  }
  font: "atkinson" | "plex" | "system"
  strong: 600 | 700 | 800
  cut: "full" | "quiet" | "off"
  density: "compact" | "default" | "comfortable"
  theme: "light" | "dark" | "system"
  motion: "full" | "reduce"
}`

const SCOPE = `import { DEFAULT_CONFIG, KeylineConfigScope, PALETTES } from "@/components/keyline/lib/keyline-config"

const branch = { ...DEFAULT_CONFIG, theme: "system", palette: { ...PALETTES.harbor } } as const

export function BranchPortal({ children }: { children: React.ReactNode }) {
  return (
    <KeylineConfigScope config={branch} name="branch">
      {children}
    </KeylineConfigScope>
  )
}`

const BY_HAND = `/* your stylesheet: the tokens for one scope */
[data-kl-config="billing"] {
  --kl-commit: oklch(0.47 0.12 222);
  --kl-neutral-h: 225;
}`

const BY_HAND_HTML = `<section data-kl-config="billing" data-kl-density="compact">…</section>`

const GENERATE = `import { DEFAULT_CONFIG, configAttributes, configToCss } from "@/components/keyline/lib/keyline-config"

const config = { ...DEFAULT_CONFIG, font: "plex", cut: "quiet" } as const

configToCss(config)                          // :root { …the tokens that differ from the defaults }
configToCss(config, { scope: "billing" })    // [data-kl-config="billing"] { … }
configAttributes(config)                     // { className, "data-kl-density", "data-kl-motion" } for <html>`

const OVERLAY = `"use client"

import { Popover } from "@base-ui/react/popover"
import { scopeProps, useKeylineScope } from "@/components/keyline/lib/keyline-scope"

// the popup half of a Base UI Popover: render it inside <Popover.Root> beside your <Popover.Trigger>
export function NotePopupContent({ children }: { children: React.ReactNode }) {
  // open = false: the probe inside the portal reads the scope only while the popup is mounted
  const [marker, scope, probe] = useKeylineScope(false)
  return (
    <>
      {marker}
      <Popover.Portal>
        {probe}
        <Popover.Positioner {...scopeProps(scope)}>
          <Popover.Popup className="border-2 border-kl-line bg-kl-raised text-kl-ink">{children}</Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </>
  )
}`

const SCOPE_PROPS: Prop[] = [
  { name: "config", type: "KeylineConfig", default: "—", description: <>The whole configuration. Start from <code>DEFAULT_CONFIG</code> and change what you need.</> },
  { name: "name", type: "string", default: "\"\"", description: <>Written to <code>data-kl-config</code>. Name it to also target the scope from your own CSS.</> },
  { name: "...props", type: "ComponentProps<\"div\">", default: "—", description: <>Passed to the <code>div</code>. Your <code>className</code> and <code>style</code> are merged with the scope&apos;s.</> },
]

const EXPORTS: ReferenceRow[] = [
  { name: <code>KeylineConfigScope</code>, value: "component", description: "A div that applies a configuration to everything inside it, overlays included." },
  { name: <code>DEFAULT_CONFIG</code>, value: <code>KeylineConfig</code>, description: <>Keyline&apos;s defaults. Its <code>theme</code> is <code>&quot;light&quot;</code>: set <code>&quot;system&quot;</code> to follow the page.</> },
  { name: <code>PALETTES</code>, value: "object", description: <>Four presets checked for signal contrast in both themes: <code>signal</code> (the default), <code>harbor</code>, <code>ember</code>, <code>ledger</code>.</> },
  { name: <code>configTokens</code>, value: <code>(config) =&gt; Record</code>, description: "Every token the configuration sets, defaults included." },
  { name: <code>changedTokens</code>, value: <code>(config) =&gt; Record</code>, description: "Only the tokens that differ from the defaults." },
  { name: <code>configAttributes</code>, value: <code>(config) =&gt; props</code>, description: <>The class and <code>data-kl-*</code> attributes for the theme, density and motion. Theme <code>&quot;system&quot;</code> sets no class.</> },
  { name: <code>configToCss</code>, value: <code>(config, {"{"} scope?, all? {"}"}) =&gt; string</code>, description: <>Unlayered CSS on <code>:root</code> or <code>[data-kl-config=&quot;scope&quot;]</code>, with the font&apos;s <code>@import</code> lines.</> },
  { name: <code>normalizeConfig</code>, value: <code>(unknown) =&gt; KeylineConfig</code>, description: "Fills missing or invalid fields from the defaults, so a stored configuration never breaks." },
  { name: <code>paletteWarnings</code>, value: <code>(palette) =&gt; string[]</code>, description: "Warns when two signal hues are too close to tell apart." },
  { name: <code>roleColor</code>, value: <code>(role, hue) =&gt; string</code>, description: "A signal colour for a hue, with its lightness fitted so on-colour text holds contrast in both themes." },
]

const TOC: TocGroup[] = [
  { label: "Configure", items: [{ id: "object", label: "The configuration" }, { id: "whole-app", label: "The whole app" }, { id: "scope", label: "One region" }] },
  { label: "Reference", items: [{ id: "scope-props", label: "KeylineConfigScope" }, { id: "helpers", label: "Helpers" }] },
  { label: "Overlays", items: [{ id: "portals", label: "Portals" }, { id: "own-overlay", label: "Your own overlay" }] },
]

export default function ConfigurationPage() {
  return (
    <DocPage name="Configuration" toc={TOC}>
      <h1>Configuration</h1>
      <p className="s-doc-lede">
        One plain object describes everything you can configure. Apply it as CSS for the whole app, or as a scope for one region: a tenant&apos;s portal, an
        embedded widget, a preview. Overlays opened inside a scope keep its configuration.
      </p>

      <ComponentDemo label="Configuration scope example" preview={<ConfigScope />} code={<ExampleCode file="config-scope.tsx" label="example code" />} />

      <h2 id="object">The configuration</h2>
      <p>
        The palette, font, weight and cut become the ten source tokens (see <Link href="/docs/theming#tokens">Theming</Link>); density, theme and motion become
        the mode attributes (see <Link href="/docs/modes">Modes</Link>). The helpers ship in the <code>keyline-config</code> item:
      </p>
      <CodeBlock code={installCommand("keyline-config")} lang="bash" copyLabel="install command" />
      <CodeBlock code={SHAPE} lang="tsx" copyLabel="configuration type" />

      <h2 id="whole-app">The whole app</h2>
      <p>
        For a configuration that never changes at runtime, write the tokens as CSS and set the mode attributes on <code>&lt;html&gt;</code>. Generate the CSS
        with <code>configToCss</code>, or write it by hand: it is plain custom properties, unlayered, after Tailwind.
      </p>
      <CodeBlock code={GENERATE} lang="tsx" copyLabel="generate CSS" />

      <h2 id="scope">One region</h2>
      <p>
        <code>KeylineConfigScope</code> renders a <code>div</code> with <code>data-kl-config</code>, the mode attributes and the tokens as inline style.
        Everything inside it, and every overlay opened from inside it, takes the configuration.
      </p>
      <CodeBlock code={SCOPE} lang="tsx" copyLabel="scope usage" />
      <p>
        Without the component, the same scope is an attribute and a rule. Derived colours are recomputed on any element with <code>data-kl-config</code>, so
        the palette tokens have to sit on one:
      </p>
      <CodeBlock code={BY_HAND} lang="css" copyLabel="scope CSS" />
      <CodeBlock code={BY_HAND_HTML} lang="tsx" copyLabel="scope element" />

      <h2 id="scope-props">KeylineConfigScope</h2>
      <PropsReference label="KeylineConfigScope props" props={SCOPE_PROPS} />
      <p className="s-small">
        Theme <code>&quot;system&quot;</code> sets no class, so the scope follows the page. A scope&apos;s density is always written, so a default-density scope
        inside a compact page is default.
      </p>

      <h2 id="helpers">Helpers</h2>
      <p>
        Everything below is exported from <code>@/components/keyline/lib/keyline-config</code>. Use them to build a theme from settings your users choose: a
        tenant&apos;s brand colour, a density preference, a saved configuration.
      </p>
      <ReferenceTable label="keyline-config exports" head={["Export", "Shape", "What it does"]} rows={EXPORTS} />

      <h2 id="portals">Portals</h2>
      <p>
        Menus, selects, popovers, date panels, dialogs, sheets, tooltips and toasts render in a portal under <code>&lt;body&gt;</code>. Each leaves a hidden
        marker where it is written and, when it opens, copies that place&apos;s resolved configuration onto its own root: the ten source tokens,{" "}
        <code>.dark</code> or <code>.light</code>, density, motion and <code>dir</code>. It re-reads while open, so a theme switch reaches an open menu. There
        is no provider.
      </p>
      <p>
        All overlays share one level (<code>--kl-z-overlay</code>) and stack in the order they open, so a select inside a dialog opens above it. Floating toasts
        sit above them on <code>--kl-z-toast</code>.
      </p>

      <h2 id="own-overlay">Your own overlay</h2>
      <p>
        An overlay you build yourself carries the configuration the same way, with <code>useKeylineScope</code> and <code>scopeProps</code> from the{" "}
        <code>keyline-scope</code> item. Render the marker where the component is written, the probe inside the portal, and spread <code>scopeProps(scope)</code>{" "}
        on the portaled root:
      </p>
      <CodeBlock code={installCommand("keyline-scope")} lang="bash" copyLabel="install command" />
      <CodeBlock code={OVERLAY} lang="tsx" copyLabel="custom overlay" />
      <p className="s-small">
        <code>useKeylineScope(open, container)</code> returns <code>[marker, scope, probe]</code>. With <code>open</code> true it reads after each render of its
        owner; with <code>false</code> the probe reads only while the portal is mounted. Pass <code>container</code> when the portal is not under{" "}
        <code>&lt;body&gt;</code>. Keyline&apos;s own overlays already do this; use it only for one of yours.
      </p>
    </DocPage>
  )
}

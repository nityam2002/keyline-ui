import * as React from "react"
import { cn } from "@/lib/utils"

import { Button } from "@/registry/keyline/ui/button"
import { Segmented, SegmentedItem } from "@/registry/keyline/ui/segmented"
import { Panel, PanelHeader, PanelBody, PanelFooter } from "@/registry/keyline/ui/panel"
import { ScrollArea } from "@/registry/keyline/ui/scroll-area"
import { Notice } from "@/registry/keyline/ui/notice"
import { Badge } from "@/registry/keyline/ui/status"
import { SwitchField } from "@/registry/keyline/ui/switch"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/registry/keyline/ui/tabs"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetBody, SheetTitle, SheetDescription } from "@/registry/keyline/ui/sheet"
import { Field, FieldLabel, FieldFrame, FieldInput, FieldDescription } from "@/registry/keyline/ui/field"
import { Slider } from "@/registry/keyline/ui/slider"
import {
  DEFAULT_CONFIG,
  FONTS,
  PALETTES,
  KeylineConfigScope,
  attributesSnippet,
  changedTokens,
  configToCss,
  configToRegistryItem,
  decodeConfig,
  encodeConfig,
  hueOf,
  normalizeConfig,
  paletteWarnings,
  roleColor,
  weights,
  type KeylineConfig,
  type PaletteId,
} from "@/registry/keyline/lib/keyline-config"
import { Preview } from "./Preview"
import { contrastOf } from "./contrast"
import { revealFocus } from "../reveal-focus"

const STORE = "keyline.playground.v1"

function loadInitial(): KeylineConfig {
  const fromUrl = decodeConfig(new URLSearchParams(location.search).get("pg"))
  if (fromUrl) return fromUrl
  try {
    const s = localStorage.getItem(STORE)
    if (s) return normalizeConfig(JSON.parse(s))
  } catch {
    /* storage unavailable: defaults */
  }
  return DEFAULT_CONFIG
}

const paletteId = (c: KeylineConfig): PaletteId | "custom" =>
  (Object.keys(PALETTES) as PaletteId[]).find((k) => {
    const p = PALETTES[k]
    return p.working === c.palette.working && p.commit === c.palette.commit && p.attention === c.palette.attention && p.neutralHue === c.palette.neutralHue && p.neutralTint === c.palette.neutralTint
  }) ?? "custom"

/* Playground shell only: not part of the registry. Layout is Tailwind in className props. */
/** a setting's help line, and the playground's notes */
const note = "m-0 text-[12.5px] leading-[1.4] text-kl-ink-2"
/** a cell of the contrast table */
const cell = "py-[3px] pr-3 pl-0 text-start [border-block-end:var(--kl-k1)_solid_var(--kl-line-soft)]"

type Diag = { slow: boolean; rtl: boolean; narrow: boolean }

export function Playground() {
  const [cfg, setCfg] = React.useState<KeylineConfig>(loadInitial)
  const [diag, setDiag] = React.useState<Diag>({ slow: false, rtl: false, narrow: false })
  const set = (c: Partial<KeylineConfig>) => setCfg((p) => ({ ...p, ...c }))
  const setPalette = (p: Partial<KeylineConfig["palette"]>) => setCfg((c) => ({ ...c, palette: { ...c.palette, ...p } }))
  React.useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(cfg))
    } catch {
      /* not persisted */
    }
  }, [cfg])
  const pid = paletteId(cfg)
  const warnings = paletteWarnings(cfg.palette)
  const maxWeight = FONTS[cfg.font].weights[1]
  const changed = Object.keys(changedTokens(cfg))
  const modeChanged = cfg.theme !== DEFAULT_CONFIG.theme || cfg.density !== DEFAULT_CONFIG.density || cfg.motion !== DEFAULT_CONFIG.motion
  const dirty = changed.length > 0 || modeChanged

  // Wide: a fit route (see the shell in App.tsx). The controls are one Keyline panel filling its pane: header and
  // actions stay put and only the settings scroll. The preview is the second scroll area; neither nests in the
  // other, and nothing is sticky. Narrow (<=960px): one column in document flow; the scroll areas grow to their
  // content, so the page scrolls.
  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(300px,360px)_minmax(0,1fr)] gap-kl-gutter [@media(max-width:960px)]:h-auto [@media(max-width:960px)]:grid-cols-[minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col" aria-label="Configuration">
        {/* one frame that fills the pane: the header and the actions stay put, only the settings scroll */}
        <Panel className="min-h-0 flex-[1_1_auto]">
          <PanelHeader title="Configuration" description="What a developer sets. Everything else is Keyline." actions={dirty ? <Badge tone="signal">{changed.length + (modeChanged ? 1 : 0)} CHANGED</Badge> : <Badge>DEFAULT</Badge>} />
          <ScrollArea className="flex-[1_1_auto]" viewportClassName="scroll-p-4" label="Settings" onFocus={revealFocus}>
          <PanelBody>
            <Setting label="Palette" help="Four coordinated sources: working set, commitment, attention and the neutral hue. Fills, text variants, foregrounds, focus, selection and data colours follow." changed={pid !== "signal"}>
              <Segmented aria-label="Palette" size="compact" value={pid} onValueChange={(v) => v !== "custom" && setPalette({ ...PALETTES[v as PaletteId] })}>
                {(Object.keys(PALETTES) as PaletteId[]).map((k) => (
                  <SegmentedItem key={k} value={k}>
                    {PALETTES[k].label}
                  </SegmentedItem>
                ))}
                <SegmentedItem value="custom" disabled={pid !== "custom"}>
                  Custom
                </SegmentedItem>
              </Segmented>
              <div className="grid gap-2.5" data-kl-density="compact">
                <Hue label="Working set" rail={[0.88, 0.15]} value={hueOf(cfg.palette.working)} swatch={cfg.palette.working} onChange={(h) => setPalette({ working: roleColor("working", h) })} />
                <Hue label="Commit" rail={[0.52, 0.17]} value={hueOf(cfg.palette.commit)} swatch={cfg.palette.commit} onChange={(h) => setPalette({ commit: roleColor("commit", h) })} />
                <Hue label="Attention" rail={[0.58, 0.18]} value={hueOf(cfg.palette.attention)} swatch={cfg.palette.attention} onChange={(h) => setPalette({ attention: roleColor("attention", h) })} />
                <Hue label="Neutral hue" rail={[0.6, 0.06]} value={cfg.palette.neutralHue} swatch={`oklch(0.6 ${0.03 * Math.max(cfg.palette.neutralTint, 0.4)} ${cfg.palette.neutralHue})`} onChange={(h) => setPalette({ neutralHue: Math.round(h) })} />
              </div>
              <Segmented aria-label="Neutral tint" size="compact" value={String(cfg.palette.neutralTint)} onValueChange={(v) => setPalette({ neutralTint: Number(v) })}>
                <SegmentedItem value="0">Grey</SegmentedItem>
                <SegmentedItem value="1">Cool</SegmentedItem>
                <SegmentedItem value="2.5">Tinted</SegmentedItem>
                {![0, 1, 2.5].includes(cfg.palette.neutralTint) ? <SegmentedItem value={String(cfg.palette.neutralTint)}>Preset</SegmentedItem> : null}
              </Segmented>
              {warnings.map((w) => (
                <Notice key={w} tone="attention" title="Signals may be confused" description={w} />
              ))}
            </Setting>

            <Setting label="Theme" help="Light, dark, or follow the page. Derived colours interpolate; a light region inside a dark page works too." changed={cfg.theme !== "light"}>
              <Segmented aria-label="Theme" size="compact" value={cfg.theme} onValueChange={(v) => set({ theme: v as KeylineConfig["theme"] })}>
                <SegmentedItem value="light">Light</SegmentedItem>
                <SegmentedItem value="dark">Dark</SegmentedItem>
                <SegmentedItem value="system">Inherit</SegmentedItem>
              </Segmented>
            </Setting>

            <Setting label="Type" help="Family pairs for the UI and Code voices. Weights stop at what the family has." changed={cfg.font !== "atkinson" || cfg.strong !== 700}>
              <Segmented aria-label="Font" size="compact" value={cfg.font} onValueChange={(v) => set({ font: v as KeylineConfig["font"] })}>
                {(Object.keys(FONTS) as (keyof typeof FONTS)[]).map((k) => (
                  <SegmentedItem key={k} value={k}>
                    {FONTS[k].label}
                  </SegmentedItem>
                ))}
              </Segmented>
              <Segmented aria-label="Strong weight" size="compact" value={String(weights(cfg).strong)} onValueChange={(v) => set({ strong: Number(v) as KeylineConfig["strong"] })}>
                {[600, 700, 800].map((w) => (
                  <SegmentedItem key={w} value={String(w)} disabled={w > maxWeight}>
                    {w === 600 ? "Firm 600" : w === 700 ? "Strong 700" : "Heavy 800"}
                  </SegmentedItem>
                ))}
              </Segmented>
              {FONTS[cfg.font].install ? <p className={note}>Not bundled: the export adds <code className="kl-code">{FONTS[cfg.font].imports[0]}</code> and its mono pair.</p> : null}
            </Setting>

            <Setting label="Cut" help="The top-start corner of frames. Off (the default) is square, never rounded; quiet and full add the cut as an accent, and spacing reserved for it collapses when it is off." changed={cfg.cut !== DEFAULT_CONFIG.cut}>
              <Segmented aria-label="Cut" size="compact" value={cfg.cut} onValueChange={(v) => set({ cut: v as KeylineConfig["cut"] })}>
                <SegmentedItem value="off">Off</SegmentedItem>
                <SegmentedItem value="quiet">Quiet</SegmentedItem>
                <SegmentedItem value="full">Full</SegmentedItem>
              </Segmented>
            </Setting>

            <Setting label="Density" help="Control height, row height, cell inset and type size together. Keyline weights never change." changed={cfg.density !== "default"}>
              <Segmented aria-label="Density" size="compact" value={cfg.density} onValueChange={(v) => set({ density: v as KeylineConfig["density"] })}>
                <SegmentedItem value="compact">Compact</SegmentedItem>
                <SegmentedItem value="default">Default</SegmentedItem>
                <SegmentedItem value="comfortable">Comfortable</SegmentedItem>
              </Segmented>
            </Setting>

            <Setting label="Motion" help="Full keeps flood, stretch and unfold. Reduced makes every state change instant. The user's system setting always wins." changed={cfg.motion !== "full"}>
              <Segmented aria-label="Motion" size="compact" value={cfg.motion} onValueChange={(v) => set({ motion: v as KeylineConfig["motion"] })}>
                <SegmentedItem value="full">Full</SegmentedItem>
                <SegmentedItem value="reduce">Reduced</SegmentedItem>
              </Segmented>
            </Setting>

            <Setting label="Diagnostics" help="For inspecting the preview. Never exported." changed={false}>
              <div className="kl-ctl kl-rows">
                <SwitchField layout="cell" label="Slow motion ×8" checked={diag.slow} onCheckedChange={(v) => setDiag((d) => ({ ...d, slow: v }))} />
                <SwitchField layout="cell" label="Right to left" checked={diag.rtl} onCheckedChange={(v) => setDiag((d) => ({ ...d, rtl: v }))} />
                <SwitchField layout="cell" label="Narrow frame (390px)" checked={diag.narrow} onCheckedChange={(v) => setDiag((d) => ({ ...d, narrow: v }))} />
              </div>
            </Setting>
          </PanelBody>
          </ScrollArea>
          <PanelFooter>
            <ExportSheet cfg={cfg} />
            <Button layout="cell" variant="quiet" disabled={!dirty} onClick={() => setCfg(DEFAULT_CONFIG)}>
              Reset
            </Button>
          </PanelFooter>
        </Panel>
      </aside>

      <ScrollArea className="h-full min-w-0 [@media(max-width:960px)]:h-auto" viewportClassName="scroll-p-4" contentClassName="pb-kl-gutter" track="rail" label="Preview" onFocus={revealFocus}>
        <KeylineConfigScope config={cfg} name="preview" className="min-w-0 bg-kl-paper text-kl-ink [font-family:var(--kl-font)] [font-size:var(--kl-fs)] [border:var(--kl-k1)_dashed_var(--kl-line-soft)]" data-testid="scope-preview">
          <div data-testid="pg-canvas" className="grid min-w-0 gap-4 p-5 data-narrow:mx-auto data-narrow:max-w-[390px]" dir={diag.rtl ? "rtl" : undefined} data-kl-motion={diag.slow ? "slow" : undefined} data-narrow={diag.narrow || undefined}>
            <Contrast cfg={cfg} />
            <Preview />
          </div>
        </KeylineConfigScope>
      </ScrollArea>
    </div>
  )
}

function Setting({ label, help, changed, children }: { label: string; help: string; changed: boolean; children: React.ReactNode }) {
  const id = React.useId()
  return (
    <section className="grid gap-2 not-first:pt-3.5 not-first:[border-block-start:var(--kl-k1)_solid_var(--kl-line-soft)]" aria-labelledby={id}>
      <div className="flex items-baseline gap-2.5">
        <h3 id={id} className="m-0 text-[14px] font-kl-strong">{label}</h3>
        {changed ? <span className="kl-code text-kl-cobalt-text">changed</span> : null}
      </div>
      <p className={note}>{help}</p>
      {children}
    </section>
  )
}

/** A hue source: Keyline's Slider on a painted rail (the spectrum at the role's own lightness and chroma),
 *  so the scale itself shows where each hue lands; the swatch is the fitted colour actually used. */
function Hue({ label, value, swatch, rail, onChange }: { label: string; value: number; swatch: string; rail: [l: number, c: number]; onChange: (h: number) => void }) {
  return (
    <Slider
      label={
        <span className="inline-flex items-center gap-2">
          <span className="size-3 flex-none [border:var(--kl-k1)_solid_var(--kl-line)]" style={{ background: swatch }} aria-hidden />
          {label}
        </span>
      }
      unit="°"
      min={0}
      max={359}
      value={Math.round(value)}
      onValueChange={(h) => onChange(h)}
      railStyle={{ background: `linear-gradient(to right in oklch longer hue, oklch(${rail[0]} ${rail[1]} 0), oklch(${rail[0]} ${rail[1]} 359))` }}
    />
  )
}

/** Measures the resolved signal pairs inside the scope (what the user will actually see), not a formula. */
function Contrast({ cfg }: { cfg: KeylineConfig }) {
  const [rows, setRows] = React.useState<{ pair: string; ratio: number; min: number }[]>([])
  const self = React.useRef<HTMLDetailsElement>(null)
  React.useLayoutEffect(() => {
    const el = self.current
    if (!el) return
    const probe = document.createElement("span")
    el.append(probe)
    const read = (t: string) => {
      probe.style.color = `var(--kl-${t})`
      return getComputedStyle(probe).color
    }
    // token pairs by role: on-colour text on each fill, text tiers on the surfaces they sit on, status text
    // in a selected row, focus and frames against page and overlay, seams inside a frame
    const pairs: [string, string, number][] = [
      ["on-yellow", "yellow", 4.5],
      ["on-cobalt", "cobalt", 4.5],
      ["on-red", "red", 4.5],
      ["on-inverse", "inverse", 4.5],
      ["ink", "raised", 4.5],
      ["ink-2", "cell", 4.5],
      ["ink-2", "raised", 4.5],
      ["ink-3", "cell", 4.5],
      ["cobalt-text", "cell", 4.5],
      ["red-text", "raised", 4.5],
      ["red-text", "yellow-row", 4.5],
      ["focus", "paper", 3],
      ["focus", "raised", 3],
      ["line", "paper", 3],
      ["line", "raised", 3],
      ["seam", "cell", 3],
      ["seam", "raised", 3],
    ]
    setRows(pairs.map(([f, b, min]) => ({ pair: `${f} / ${b}`, ratio: contrastOf(read(f), read(b)), min })))
    probe.remove()
  }, [cfg])
  const fails = rows.filter((r) => r.ratio < r.min)
  return (
    <details ref={self} data-testid="pg-contrast" className="group/contrast text-[13px]" data-fails={fails.length || undefined}>
      <summary className="flex cursor-pointer items-baseline gap-2 group-data-fails/contrast:text-kl-red-text group-data-fails/contrast:font-kl-strong">
        <span className="kl-code">CONTRAST</span> {fails.length ? `${fails.length} of ${rows.length} token pairs below WCAG 2.2 AA` : `${rows.length} token pairs meet WCAG 2.2 AA`}
      </summary>
      <p className={note}>
        These token pairs, resolved in this scope. It is not an audit of every rendered element, and passing it says nothing about comfort over long use. The rendered audit is <code>scripts/colour-audit.mjs</code>.
      </p>
      <table className="mt-2 border-collapse">
        <tbody>
          {rows.map((r) => (
            <tr key={r.pair} data-fail={r.ratio < r.min || undefined} className="data-fail:text-kl-red-text">
              <th scope="row" className={cn("kl-code", cell)}>
                {r.pair}
              </th>
              <td className={cn("kl-code", cell)}>{r.ratio.toFixed(2)}</td>
              <td className={cn("kl-code", cell)}>≥ {r.min}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}

/* ---------- export ---------- */
const exportPanel = "grid gap-3 pt-3.5 text-[13.5px] leading-[1.5]"
function ExportSheet({ cfg }: { cfg: KeylineConfig }) {
  const [scope, setScope] = React.useState("")
  const s = scope.trim().replace(/[^a-z0-9-]/gi, "") || undefined
  const css = configToCss(cfg, { scope: s })
  const item = configToRegistryItem(cfg, { scope: s })
  const attrs = attributesSnippet(cfg, s ? "section" : "html")
  const tokens = changedTokens(cfg)
  const fontPkgs = item.dependencies
  const share = `${location.origin}${location.pathname}?pg=${encodeConfig(cfg)}#/playground`
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(item, null, 2) + "\n"], { type: "application/json" }))
    const a = Object.assign(document.createElement("a"), { href: url, download: "keyline-config.json" })
    a.click()
    URL.revokeObjectURL(url)
  }
  const runtime = `import { KeylineConfigScope } from "@/components/keyline/lib/keyline-config"

const config = ${JSON.stringify(cfg, null, 2)}

<KeylineConfigScope config={config}${s ? ` name="${s}"` : ""}>…</KeylineConfigScope>`
  return (
    <Sheet>
      <SheetTrigger render={<Button layout="cell" variant="primary" />}>Install config</SheetTrigger>
      <SheetContent size={620}>
        <SheetHeader>
          <SheetTitle>Install config</SheetTitle>
          <SheetDescription>Three equivalent routes. Each produces the same tokens the preview uses.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <Field>
            <FieldLabel>Scope (optional)</FieldLabel>
            <FieldFrame>
              <FieldInput value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Whole app" />
            </FieldFrame>
            <FieldDescription>Empty: the whole app (:root). A name, for example "billing": only elements with data-kl-config="billing", and the overlays opened from inside them.</FieldDescription>
          </Field>
          <Tabs defaultValue="cli">
            <TabsList>
              <TabsTab value="cli">shadcn CLI</TabsTab>
              <TabsTab value="css">CSS</TabsTab>
              <TabsTab value="runtime">Runtime scope</TabsTab>
            </TabsList>
            <TabsPanel value="cli" className={exportPanel}>
              <ol className="m-0 grid gap-3.5 ps-[18px]">
                <li>
                  Install Keyline and the components you use (map <code className="kl-code">@keyline-ui</code> in components.json first):
                  <Code>{"npx shadcn@latest add @keyline-ui/keyline @keyline-ui/button @keyline-ui/table"}</Code>
                </li>
                <li>
                  Save <code className="kl-code">keyline-config.json</code> in your project and add it from that path:
                  <div className="my-2 flex flex-wrap gap-3">
                    <Button onClick={download}>Download keyline-config.json</Button>
                  </div>
                  <Code>{"npx shadcn@latest add ./keyline-config.json"}</Code>
                  It writes all {Object.keys(item.css[Object.keys(item.css).find((k) => !k.startsWith("@import"))!] as object).length} configurable tokens unlayered, so they win over Keyline's defaults wherever the CLI places them. {Object.keys(tokens).length ? `${Object.keys(tokens).length} differ from the defaults (${Object.keys(tokens).join(", ")}).` : "All of them are at their defaults, so adding it restores the defaults over an earlier configuration."}{fontPkgs.length ? ` It also installs ${fontPkgs.join(" and ")} with their @import lines.` : ""} Adding a new file later updates each value in place. The CLI never removes lines, so after switching font, delete the old font's @import lines by hand.
                </li>
                <li>
                  {attrs ? (
                    <>
                      Not carried by the CLI: modes are attributes, because they also change per region. Add them yourself{s ? " to the scope element" : " to <html>"}:
                      <Code>{attrs.replace(">", s ? ` data-kl-config="${s}">` : ">")}</Code>
                    </>
                  ) : s ? (
                    <>
                      Mark the region: <Code>{`<section data-kl-config="${s}">`}</Code>
                    </>
                  ) : (
                    <>No attributes needed: theme, density and motion are at their defaults.</>
                  )}
                </li>
              </ol>
            </TabsPanel>
            <TabsPanel value="css" className={exportPanel}>
              <p className="m-0">Paste anywhere in your CSS after Tailwind. It is unlayered, so order relative to the Keyline item does not matter.</p>
              <Code>{css}</Code>
              {attrs ? <Code>{attrs.replace(">", s ? ` data-kl-config="${s}">` : ">")}</Code> : null}
              {fontPkgs.length ? <Code>{`npm install ${fontPkgs.join(" ")}`}</Code> : null}
            </TabsPanel>
            <TabsPanel value="runtime" className={exportPanel}>
              <p className="m-0">
                For values chosen at runtime (a tenant's brand, a preview). Needs <code className="kl-code">@keyline-ui/keyline-config</code>. Overlays opened inside carry the configuration.
              </p>
              <Code>{runtime}</Code>
            </TabsPanel>
          </Tabs>
          <Notice tone="info" title="Share this configuration" description={<span className="[font:11px/1.4_var(--kl-font-mono)] [overflow-wrap:anywhere]">{share}</span>} actions={<Button layout="cell" onClick={() => navigator.clipboard?.writeText(share)}>Copy link</Button>} />
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}

function Code({ children }: { children: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div data-testid="pg-code" className="my-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-start [border:var(--kl-k1)_solid_var(--kl-line)] bg-kl-tint">
      <pre className="m-0 max-h-80 overflow-auto px-3 py-2.5 [font:12px/1.5_var(--kl-font-mono)]">
        <code>{children}</code>
      </pre>
      <Button
        className="m-1"
        size="compact"
        variant="quiet"
        signal={copied ? "done" : "idle"}
        onClick={() => {
          navigator.clipboard?.writeText(children)
          setCopied(true)
          setTimeout(() => setCopied(false), 900)
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}

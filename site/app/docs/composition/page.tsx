import { pageDescription } from "@site/lib/catalog"
import { pageMetadata } from "@site/lib/seo"
import Link from "next/link"
import { CodeBlock } from "@site/components/code-block"
import { ComponentDemo } from "@site/components/component-demo"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { ReferenceTable, type ReferenceRow } from "@site/components/reference-table"
import { CompositionCells } from "@site/components/guide-previews"
import { installCommand } from "@site/lib/registry"

export const metadata = pageMetadata({ title: "Composition", description: pageDescription("/docs/composition"), path: "/docs/composition" })

const CELLS = `<PanelFooter>
  <span className="flex-1 px-3">Draft</span>
  <Button layout="cell">Save draft</Button>
  <Button layout="cell" variant="primary">Send order</Button>
</PanelFooter>`

const SELECTION = `import { useMemo } from "react"
import { useSelection, patchWithUndo } from "@/components/keyline/lib/selection"

// matching: every row the filters let through; page: the rows on screen now. Keep both stable.
const matching = useMemo(() => filtered.map((r) => r.id), [filtered])
const page = useMemo(() => shown.map((r) => r.id), [shown])
const { selected, scope, toggle, setPage, selectAllMatching, keepVisibleOnly, clear } = useSelection(matching, page)

// scope.count selected in all; scope.hidden of them are filtered out but still acted on
const reassign = (carrier: string) => {
  const { next, undo, count } = patchWithUndo(rows, selected, (r) => ({ ...r, carrier }))
  setRows(next)
  notify({ title: \`\${count} reassigned\`, action: { label: "Undo", onClick: () => setRows(undo) } })   // notify = useToast()
}`

const HELPERS: ReferenceRow[] = [
  { name: <code>keyline-config</code>, value: "Supported", description: <><code>KeylineConfigScope</code> and the configuration helpers. See <Link href="/docs/configuration#helpers">Configuration</Link>.</> },
  { name: <code>keyline-scope</code>, value: "Supported", description: <><code>useKeylineScope</code> and <code>scopeProps</code>, for an overlay of your own. See <Link href="/docs/configuration#own-overlay">Configuration</Link>.</> },
  { name: <code>selection</code>, value: "Supported", description: <>Selection by id that survives filtering and paging, with undo by snapshot. See <a href="#selection">below</a>.</> },
  { name: <code>collection</code>, value: "Through Table", description: <>The sort cycle and comparator. Import them from <code>table</code>, which re-exports them (see <Link href="/docs/components/table">Table</Link>).</> },
  { name: <code>calendar</code>, value: "Through Date range", description: <><code>formatRange</code> and <code>countAvailable</code>, re-exported by <Link href="/docs/components/date-range">Date range</Link>.</> },
  { name: <><code>keyline-motion</code> <code>options</code> <code>scroll-edges</code></>, value: "Internal", description: "Installed as dependencies of the components that use them. Their exports may change between versions; don't build on them." },
]

const LIMITS: ReferenceRow[] = [
  { name: "Hover card", value: "Base UI Preview Card", description: "Its content is not reachable by keyboard or screen reader. Use it only to preview what the linked page already holds; never put actions in it." },
  { name: "Context menu", value: "By design", description: "A shortcut, not the only path. Put every action somewhere visible too." },
  { name: "Toolbar", value: "Base UI Toolbar", description: "Home and End do nothing; the arrow keys move and wrap." },
  { name: "Toast", value: "Base UI Toast", description: <>A failed toast&apos;s action sits in an <code>aria-hidden</code> root until the toast takes focus, because Base UI announces high-priority toasts through its own live region. Keyboard users reach it with F6.</> },
  { name: "Resizable", value: "WCAG 2.5.7", description: <>Dragging needs a pointer alternative. Double-click resets the layout; where a panel can be hidden, add a button that calls <code>panelRef.current.collapse()</code> or <code>.expand()</code>. Name each handle after the panel it resizes.</> },
  { name: "Forms", value: "Uneven", description: <><code>DatePicker</code> takes <code>name</code> but no <code>required</code>, <code>invalid</code>, <code>error</code> or <code>validate</code>. <code>DateRangePicker</code> and <code>Multiselect</code> take no <code>name</code>. <code>RadioGroup</code> has no <code>legend</code>, description or error props. <code>Multiselect</code> needs <code>loadOptions</code>, even for a fixed list.</> },
  { name: "Button", value: <code>signal=&quot;done&quot;</code>, description: <>Stays until you set it back to <code>&quot;idle&quot;</code>.</> },
  { name: "The cut", value: "Outside Chromium", description: <>Drawn with <code>clip-path</code>; a focus outline stops at the diagonal instead of following it.</> },
  { name: "Text-entry focus", value: "WCAG 2.4.13", description: <>Fields, select and picker triggers meet WCAG 2.2 AA, not AAA 2.4.13, on standalone controls. Set <code>--kl-edge-band: 2px</code> if you need it.</> },
]

const TOC: TocGroup[] = [
  { label: "Words", items: [{ id: "terms", label: "Terms used in these docs" }] },
  { label: "Rules", items: [{ id: "cells", label: "Controls and cells" }, { id: "edges", label: "One owner per edge" }, { id: "sizing", label: "Sizing" }, { id: "overlays", label: "Overlays" }, { id: "public-api", label: "The public API" }] },
  { label: "Helpers", items: [{ id: "helpers", label: "Shared helpers" }, { id: "selection", label: "Selection" }] },
  { label: "Limits", items: [{ id: "limitations", label: "Known limitations" }] },
]

export default function CompositionPage() {
  return (
    <DocPage name="Composition" toc={TOC}>
      <h1>Composition</h1>
      <p className="s-doc-lede">
        Keyline components join on shared keylines: a frame holds cells, and the seam between two cells is drawn once. A few rules keep that true when you
        put components together.
      </p>

      <ComponentDemo label="Composition example" preview={<CompositionCells />} code={<ExampleCode file="composition-cells.tsx" label="example code" />} />

      <h2 id="terms">Terms used in these docs</h2>
      <p>The component pages use a few words in a narrow sense. Each describes something you can see on the screen.</p>
      <ul>
        <li>
          <b>Frame.</b> The border around a component or region. Its weight says what it is: 3px for a region such as a panel, 2px for a standalone control.
        </li>
        <li>
          <b>Cell.</b> One part of a frame: a button in a footer, a tab, a table cell. State is shown inside a cell, so the layout around it doesn&apos;t move.
        </li>
        <li>
          <b>Seam</b> or <b>keyline.</b> The 1px line where two cells meet. It is drawn once, by one of them, so neighbours share it.
        </li>
        <li>
          <b>Docked.</b> A menu, list or calendar that opens against its trigger&apos;s edge and shares it, so the two read as one shape.
        </li>
        <li>
          <b>Flood</b> and <b>band.</b> A cell&apos;s own state fills the whole cell (a flood); a choice moving within a group slides one band to it.
        </li>
        <li>
          <b>Ink, cobalt, yellow, red.</b> The four state colours. Ink is the current choice; cobalt the current place and the primary action; yellow
          the working set you are about to act on, such as selected rows; red what needs attention: invalid, failed or destructive. Each also has a
          shape, glyph or position, so nothing depends on colour alone.
        </li>
        <li>
          <b>Code voice.</b> The monospace face, used for codes, keys, figures and timeline steps.
        </li>
        <li>
          <b>Lamp.</b> A small square that is hollow when off and solid when on, for independent on/off state.
        </li>
        <li>
          <b>The cut.</b> An optional bevel on a frame&apos;s top-start corner. It is off by default; see <Link href="/docs/modes">Modes</Link>.
        </li>
      </ul>

      <h2 id="cells">Controls and cells</h2>
      <p>Layout is declared, never inferred.</p>
      <ul>
        <li>
          A control takes <code>layout=&quot;control&quot;</code>, the default: its own 2px frame and, when the cut is on, the cut.
        </li>
        <li>
          With <code>layout=&quot;cell&quot;</code>, the control is a cell of the frame it sits in: no border, no cut, no background, and it fills the cell.
        </li>
        <li>
          Putting a control inside a frame changes nothing by itself. Declare <code>layout=&quot;cell&quot;</code>.
        </li>
      </ul>
      <CodeBlock code={CELLS} lang="tsx" copyLabel="cells" />

      <h2 id="edges">One owner per edge</h2>
      <p>
        Rows of cells (panel and dialog footers, bulk bars, pagers, inspector actions) draw the dividers between their cells. Don&apos;t add borders to cell
        controls: a second line on the same edge reads as a thicker one.
      </p>

      <h2 id="sizing">Sizing</h2>
      <p>Sizing is yours; the narrow layout is the component&apos;s.</p>
      <ul>
        <li>Give parts widths with your own classes. They describe the wide layout.</li>
        <li>
          Components that rearrange when narrow measure themselves, not the viewport. A table frame narrower than 560px stacks its toolbar and bulk bar; a{" "}
          <code>Form</code> with <code>orientation=&quot;responsive&quot;</code> goes horizontal from 560px of its own width.
        </li>
        <li>
          Size a scroll region&apos;s root yourself (a height or max-height on <Link href="/docs/components/scroll-area">Scroll Area</Link>). Don&apos;t wrap Select,
          Multiselect, Menu or Command lists in one: they keep their own native scroller.
        </li>
      </ul>

      <h2 id="overlays">Overlays</h2>
      <p>
        Overlays share one level, <code>--kl-z-overlay</code>, and stack in the order they open, so a select inside a dialog opens above it. Floating toasts sit
        above on <code>--kl-z-toast</code>. Each overlay keeps the configuration of the place it is written (see{" "}
        <Link href="/docs/configuration#portals">Configuration</Link>).
      </p>

      <h2 id="public-api">The public API</h2>
      <p>
        Compose with props, Tailwind utilities and the <Link href="/docs/theming#utilities">role utilities</Link>. The public classes are <code>kl-code</code> (the
        Code voice: units, IDs) and <code>kl-count</code> (the Count voice: big numbers). Every other <code>kl-</code> class is internal and may change. If a
        composition needs one, that is a gap in Keyline: report it rather than depending on the class.
      </p>

      <h2 id="helpers">Shared helpers</h2>
      <p>
        The <code>lib/</code> items are installed with the components that need them. Only some of them are contracts you can build on:
      </p>
      <ReferenceTable label="Shared helpers" head={["Item", "Status", "Use"]} rows={HELPERS} />

      <h2 id="selection">Selection</h2>
      <p>
        Records are selected by id, so a selection survives filtering, sorting and paging. The scope tells you how many selected records the current filters
        hide, because a bulk action still acts on them; say so in the bulk bar. Undo restores each record&apos;s own previous value and puts removed records back
        where they were. The <Link href="/docs/blocks/shipments">Shipments block</Link> uses all of it.
      </p>
      <CodeBlock code={installCommand("selection")} lang="bash" copyLabel="install command" />
      <CodeBlock code={SELECTION} lang="tsx" copyLabel="selection usage" />
      <p className="s-small">
        <code>scope</code> holds <code>count</code>, <code>visible</code>, <code>hidden</code>, <code>page</code> (<code>&quot;all&quot;</code>,{" "}
        <code>&quot;some&quot;</code> or <code>&quot;none&quot;</code>, for the header checkbox) and <code>allMatching</code>. <code>removeWithUndo</code> works like{" "}
        <code>patchWithUndo</code> and returns <code>{"{ next, undo, removed }"}</code>. The pure functions (<code>toggle</code>, <code>setMany</code>,{" "}
        <code>restrictTo</code>, <code>scopeOf</code>) are exported too, for state kept outside React.
      </p>

      <h2 id="limitations">Known limitations</h2>
      <p>What Keyline does not do yet, and what to do instead. Most come from the Base UI primitive underneath.</p>
      <ReferenceTable label="Known limitations" head={["Where", "Cause", "What to do"]} rows={LIMITS} />
    </DocPage>
  )
}

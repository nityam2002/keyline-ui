import { pageMetadata } from "@site/lib/seo"
import Link from "next/link"
import { CodeBlock } from "@site/components/code-block"
import { ComponentDemo } from "@site/components/component-demo"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import { InstallCommand } from "@site/components/install-command"
import type { TocGroup } from "@site/components/page-toc"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { ShipmentsBlock } from "@site/components/guide-previews"
import { CATALOG, pageDescription } from "@site/lib/catalog"
import block from "../../../../public/r/shipments-demo.json"

const ITEM = "shipments-demo"

export const metadata = pageMetadata({ title: "Shipments block", description: pageDescription("/docs/blocks/shipments"), path: "/docs/blocks/shipments" })

// What the block installs with it, read from the built registry item, linked to each component's page
const ENTRIES = CATALOG.flatMap((g) => g.items)
const USES = block.registryDependencies
  .map((d) => d.replace(/^@keyline-ui\//, ""))
  .filter((n) => n !== "keyline")
  .map((n) => ({ item: n, entry: ENTRIES.find((e) => e.item === n) }))

const PAGE = `// app/shipments/page.tsx (Next.js App Router), or any route in Vite
import { Shipments } from "@/components/keyline/blocks/shipments/shipments"

export default function ShipmentsPage() {
  return <Shipments />
}`

const DATA = `// components/keyline/blocks/shipments/shipments-data.ts: the fictional records the block starts from
export type Shipment = {
  id: string
  dest: string
  carrier: string
  status: "booked" | "transit" | "delayed" | "docs" | "delivered" | "none"
  kg: number | null
  eur: number
  eta: Date
  pallets: number
  reference: string
}

export function makeShipments(n = 64): Shipment[] { … }`

const PROPS: Prop[] = [
  { name: "initialLoad", type: "\"ready\" | \"loading\" | \"error\"", default: "\"ready\"", description: <>The table&apos;s first state. <code>&quot;loading&quot;</code> shows the loading rows, then loads; <code>&quot;error&quot;</code> starts on the error row with Retry.</> },
  { name: "portalContainer", type: "RefObject<HTMLElement | null>", default: "—", description: <>Where the block&apos;s sheets and menus render, for a block mounted inside a frame of your own. They carry its configuration either way.</> },
  { name: "className", type: "string", default: "—", description: <>Added to the <code>AppShell</code> root.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Inside", items: [{ id: "what-it-shows", label: "What it shows" }, { id: "components", label: "Components" }, { id: "your-data", label: "Your own data" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function ShipmentsPage() {
  return (
    <DocPage name="Shipments" toc={TOC}>
      <h1>Shipments</h1>
      <p className="s-doc-lede">
        A complete records screen built only from Keyline components: a freight dispatcher&apos;s list of shipments, with filters, selection, bulk actions that
        can be undone, an inspector and a command menu. Install it to see how the parts compose, then make it yours.
      </p>

      <ComponentDemo label="Shipments block example" preview={<ShipmentsBlock />} code={<ExampleCode file="shipments-block.tsx" label="example code" />} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />
      <p>
        It installs <code>shipments.tsx</code> and <code>shipments-data.ts</code> to <code>components/keyline/blocks/shipments/</code>, the block&apos;s own CSS,
        and every component it uses.
      </p>

      <h2 id="usage">Usage</h2>
      <p>
        The block is one component, the size of a page. It starts with <code>&quot;use client&quot;;</code>, so a Next.js server page can render it.
      </p>
      <CodeBlock code={PAGE} lang="tsx" copyLabel="usage" />
      <p className="s-small">
        The table&apos;s height follows the viewport, so give the block the page rather than a box inside one. It binds ⌘K (Ctrl+K) to its command menu on the
        window.
      </p>

      <h2 id="what-it-shows">What it shows</h2>
      <ul>
        <li>
          An <Link href="/docs/components/app-shell">App shell</Link> with a sidebar that collapses to a rail, a breadcrumb header, and the inspector as its aside:
          inline when the shell is wide, a sheet when it is narrow.
        </li>
        <li>
          Views with counts, search, a carrier <Link href="/docs/components/multiselect">Multiselect</Link>, an ETA{" "}
          <Link href="/docs/components/date-range">Date range</Link>, and status filters in a cell{" "}
          <Link href="/docs/components/toolbar">Toolbar</Link> that move into More when the row runs out of room.
        </li>
        <li>
          A <Link href="/docs/components/table">Table</Link> sorted by several columns, with hideable columns, rows that expand into a timeline of legs, loading,
          empty and error rows, and a pager that sets the page size.
        </li>
        <li>
          Selection by id that survives filtering and paging, with a bulk bar that says how many selected shipments are filtered out (see{" "}
          <Link href="/docs/composition#selection">Selection</Link>).
        </li>
        <li>
          Bulk actions with Undo in a docked <Link href="/docs/components/toast">Toast</Link>: assign a carrier, move ETAs, and cancel behind an{" "}
          <Link href="/docs/components/alert-dialog">Alert dialog</Link>. Assigning six or more to Rhenus Road fails on purpose, to show the failed state.
        </li>
        <li>
          An <Link href="/docs/components/inspector">Inspector</Link> form with validation, and a <Link href="/docs/components/command">Command menu</Link> that
          runs the same actions by keyboard.
        </li>
      </ul>

      <h2 id="components">Components</h2>
      <p>The block installs these, from the built registry item:</p>
      <ul className="columns-2 max-[521px]:columns-1">
        {USES.map((u) => (
          <li key={u.item}>{u.entry?.href ? <Link href={u.entry.href}>{u.entry.name}</Link> : <code>{u.item}</code>}</li>
        ))}
      </ul>

      <h2 id="your-data">Your own data</h2>
      <p>
        The records are fictional and generated in <code>shipments-data.ts</code>, deterministically, so every render is the same. The actions wait a moment to
        stand in for a server. Replace <code>makeShipments</code> and those waits with your own data and calls; the block is your code once it is installed.
      </p>
      <CodeBlock code={DATA} lang="tsx" copyLabel="data shape" />

      <h2 id="props">Props</h2>
      <PropsReference label="Shipments props" props={PROPS} />
      <p className="s-small">
        The item is named <code>shipments-demo</code> because it is a demonstration: its labels, data and rules belong to one fictional company. Re-adding it
        with <code>--overwrite</code> replaces your edits.
      </p>
    </DocPage>
  )
}

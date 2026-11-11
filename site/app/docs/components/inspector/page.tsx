import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { InspectorOrder } from "@site/components/layout-previews"

const ITEM = "inspector"

export const metadata = componentMetadata("Inspector", "A React inspector panel beside a list that shows the chosen record under the row's own code. The body scrolls, the actions stay at the foot, and the list stays usable.", "inspector")

const IMPORT = `import { Inspector, InspectorActions, InspectorBody, InspectorFacts, InspectorHeader, InspectorRow, InspectorSection } from "@/components/keyline/ui/inspector"`

const USAGE = `<Inspector aria-label="Order DM-4109">
  <InspectorHeader code="DM-4109" title="Vance Refrigeration" status={<Status kind="attention">Held</Status>} onClose={close} />
  <InspectorBody>
    <InspectorFacts items={[{ label: "Cases", value: 12 }]} />
  </InspectorBody>
  <InspectorActions>…</InspectorActions>
</Inspector>`

const PROPS: Prop[] = [
  { name: "code \u00b7 title \u00b7 status", type: "ReactNode", default: "\u2014", description: <>On <code>InspectorHeader</code>: the record&apos;s code, its name and a Status.</> },
  { name: "onClose \u00b7 closeLabel", type: "() => void \u00b7 string", default: "\u2014 \u00b7 \"Close inspector\"", description: "Adds a close cell." },
  { name: "items", type: "{ label, value }[]", default: "\u2014", description: <>On <code>InspectorFacts</code>: facts two to a row.</> },
  { name: "InspectorSection \u00b7 InspectorRow", type: "div", default: "\u2014", description: "A labelled cell, and a row that puts two short sections side by side." },
  { name: "InspectorActions", type: "div", default: "\u2014", description: <>A row of <code>Button layout=&quot;cell&quot;</code> at the foot.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function InspectorPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Inspector" toc={TOC}>
      <h1>Inspector</h1>
      <p className="s-doc-lede">
        A panel beside a list that shows the chosen record. Its header cites the same code as the row, so the two share an address. The body scrolls and the actions stay put at the foot. It doesn&apos;t block the page: you can choose another row while it&apos;s open.
      </p>

      <ComponentDemo label="Inspector example" preview={<InspectorOrder />} code={code("inspector-order.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Inspector props" props={PROPS} />
      <p className="s-small">
        In an AppShell, pass it as <code>aside</code> and it becomes a sheet on narrow screens; the App shell page shows that.
      </p>
    </DocPage>
  )
}

import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { SegmentedPeriod, SegmentedPanel } from "@site/components/input-previews"

const ITEM = "segmented"

export const metadata = componentMetadata("Segmented", "A React segmented control on Base UI: one choice of a few on one line, with an ink band that stretches to the chosen cell. Scrolls when out of room.", "segmented")

const IMPORT = `import { Segmented, SegmentedItem } from "@/components/keyline/ui/segmented"`

const USAGE = `<Segmented aria-label="Period" value={period} onValueChange={setPeriod}>
  <SegmentedItem value="week">This week</SegmentedItem>
  <SegmentedItem value="month">This month</SegmentedItem>
</Segmented>`

const PROPS: Prop[] = [
  { name: "value", type: "string", default: "—", description: <>The chosen item, with <code>onValueChange</code>. Or start with <code>defaultValue</code>.</> },
  { name: "size", type: '"default" | "compact"', default: '"default"', description: "Compact fits a panel header or a toolbar." },
  { name: "layout", type: '"control" | "cell"', default: '"control"', description: <><code>cell</code> drops the frame, to sit in a panel header.</> },
  { name: "name", type: "string", default: "—", description: "Submits the chosen value with a form." },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Examples", items: [{ id: "in-a-panel", label: "In a panel" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function SegmentedPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Segmented" toc={TOC}>
      <h1>Segmented</h1>
      <p className="s-doc-lede">
        One choice of a few, on one line in one frame. The ink band stretches to the chosen cell, leading edge first. When the row runs out of room it scrolls inside the frame.
      </p>

      <ComponentDemo widths label="Segmented example" preview={<SegmentedPeriod />} code={code("segmented-period.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="in-a-panel">In a panel</h3>
      <p>
        <code>size=&quot;compact&quot;</code> with <code>layout=&quot;cell&quot;</code> fits a panel header and changes what the panel shows.
      </p>
      <ComponentDemo label="Panel example" preview={<SegmentedPanel />} code={code("segmented-panel.tsx", "panel example code")} />

      <h2 id="props">Props</h2>
      <PropsReference label="Segmented props" props={PROPS} />
      <p className="s-small">
        It is a radio group: Tab enters at the chosen cell and arrow keys move and choose. Name it with <code>aria-label</code>. Built on{" "}
        <a href="https://base-ui.com/react/components/radio">Base UI Radio Group</a>.
      </p>
    </DocPage>
  )
}

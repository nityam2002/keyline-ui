import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { RadioGroupDelivery, RadioGroupPanel } from "@site/components/input-previews"

const ITEM = "radio-group"

export const metadata = componentMetadata("Radio group", "A React radio group of framed rows with room for a description and a price. The chosen row is ink, and the ink stretches to the next choice. On Base UI.", "radio-group")

const IMPORT = `import { RadioGroup, RadioGroupItem } from "@/components/keyline/ui/radio-group"`

const USAGE = `<RadioGroup aria-label="Delivery" value={how} onValueChange={setHow}>
  <RadioGroupItem value="truck" label="Thursday route" meta="Free" />
  <RadioGroupItem value="morning" label="Next morning" meta="" />
</RadioGroup>`

const PROPS: Prop[] = [
  { name: "value", type: "string", default: "—", description: <>The chosen item, with <code>onValueChange</code>. Or start with <code>defaultValue</code>.</> },
  { name: "layout", type: '"control" | "cell"', default: '"control"', description: <><code>cell</code> drops the frame, so the rows sit in a panel.</> },
  { name: "name", type: "string", default: "—", description: "Submits the chosen value with a form." },
  { name: "label", type: "ReactNode", default: "—", description: <>On <code>RadioGroupItem</code>: the row&apos;s name. Required.</> },
  { name: "description", type: "ReactNode", default: "—", description: <>On <code>RadioGroupItem</code>: a line under the label, read out with it.</> },
  { name: "meta", type: "ReactNode", default: "—", description: <>On <code>RadioGroupItem</code>: a cell at the end, for a price or a count.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Examples", items: [{ id: "in-a-panel", label: "In a panel" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function RadioGroupPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Radio group" toc={TOC}>
      <h1>Radio group</h1>
      <p className="s-doc-lede">
        One choice of a few, as framed rows with room for a description and a price. The chosen row is ink, and the ink stretches to the next choice, leading edge first.
      </p>

      <ComponentDemo label="Radio group example" preview={<RadioGroupDelivery />} code={code("radio-group-delivery.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="in-a-panel">In a panel</h3>
      <p>
        With <code>layout=&quot;cell&quot;</code> the rows share the panel&apos;s keylines. The panel header names the choice, so the group takes an <code>aria-label</code>.
      </p>
      <ComponentDemo label="Panel example" preview={<RadioGroupPanel />} code={code("radio-group-panel.tsx", "panel example code")} />

      <h2 id="props">Props</h2>
      <PropsReference label="Radio group props" props={PROPS} />
      <p className="s-small">
        Name the group with <code>aria-label</code> or <code>aria-labelledby</code>. Tab enters at the chosen row and arrow keys move and choose. For a short choice on one line, Segmented fits better. Built on{" "}
        <a href="https://base-ui.com/react/components/radio">Base UI Radio Group</a>.
      </p>
    </DocPage>
  )
}

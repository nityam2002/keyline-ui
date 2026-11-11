import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { ToggleReceipts, ToggleIcon } from "@site/components/action-previews"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"

const ITEM = "toggle"

export const metadata = componentMetadata("Toggle", "A React toggle button on Base UI that stays pressed: the cell fills yellow and lights its lamp, so the state has a shape as well as a colour.", "toggle")

const IMPORT = `import { Toggle } from "@/components/keyline/ui/toggle"`

const USAGE = `<Toggle pressed={missingOnly} onPressedChange={setMissingOnly}>
  Missing receipt
</Toggle>`

const PROPS: Prop[] = [
  { name: "pressed", type: "boolean", default: "—", description: <>Controlled state, with <code>onPressedChange</code>. Or start it with <code>defaultPressed</code>.</> },
  { name: "count", type: "ReactNode", default: "—", description: "A count after the label: how many rows the toggle would show." },
  { name: "icon", type: "boolean", default: "false", description: <>A square, icon-only toggle; give it an <code>aria-label</code>. Pressed shows a floor keyline instead of the lamp.</> },
  { name: "layout", type: '"control" | "cell"', default: '"control"', description: <><code>cell</code> drops the frame, for a toggle in a panel header or a field frame.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Examples", items: [{ id: "icon", label: "Icon" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function TogglePage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Toggle" toc={TOC}>
      <h1>Toggle</h1>
      <p className="s-doc-lede">
        A button that stays pressed. Pressed fills the cell yellow and lights the lamp, so the state has a shape as well as a colour. The label never changes.
      </p>

      <ComponentDemo label="Toggle example" preview={<ToggleReceipts />} code={code("toggle-receipts.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="icon">Icon</h3>
      <p>
        With <code>icon</code> the toggle is a square cell. Name it with <code>aria-label</code>: the name says what pressing does, and <code>aria-pressed</code> says whether it is on.
      </p>
      <ComponentDemo label="Icon example" preview={<ToggleIcon />} code={code("toggle-icon.tsx", "icon example code")} />

      <h2 id="props">Props</h2>
      <PropsReference label="Toggle props" props={PROPS} />
      <p className="s-small">
        For several independent toggles in one frame, use Toggle group. For one choice of many, use Segmented. Built on{" "}
        <a href="https://base-ui.com/react/components/toggle">Base UI Toggle</a>.
      </p>
    </DocPage>
  )
}

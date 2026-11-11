import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { CheckboxClosing, CheckboxInvoices } from "@site/components/input-previews"

const ITEM = "checkbox"

export const metadata = componentMetadata("Checkbox", "A React checkbox for one yes-or-no choice, alone or as a labelled row. Checked fills the square with ink, so the state reads without colour. On Base UI.", "checkbox")

const IMPORT = `import { CheckboxField } from "@/components/keyline/ui/checkbox"`

const USAGE = `<CheckboxField
  label="Lock the warehouse door"
  description="Darryl leaves by the loading dock at 5."
  checked={locked}
  onCheckedChange={setLocked}
/>`

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: <>On <code>CheckboxField</code>: the row&apos;s name. The whole row toggles the box.</> },
  { name: "description", type: "ReactNode", default: "—", description: "A line under the label, read out with it." },
  { name: "checked", type: "boolean", default: "—", description: <>With <code>onCheckedChange</code>. Or start with <code>defaultChecked</code>.</> },
  { name: "indeterminate", type: "boolean", default: "false", description: <>Draws a bar: some of a set is checked. Checkbox group sets it for you on its All row.</> },
  { name: "layout", type: '"control" | "cell"', default: '"control"', description: <>On <code>CheckboxField</code>: <code>cell</code> is a row inside another frame, such as a panel.</> },
  { name: "name", type: "string", default: "—", description: "Submits the box with a form." },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Examples", items: [{ id: "bare", label: "Bare box" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function CheckboxPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Checkbox" toc={TOC}>
      <h1>Checkbox</h1>
      <p className="s-doc-lede">A square box for one yes-or-no choice. Checked fills it with ink, so the state reads without colour.</p>

      <ComponentDemo label="Checkbox example" preview={<CheckboxClosing />} code={code("checkbox-closing.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="bare">Bare box</h3>
      <p>
        <code>Checkbox</code> on its own, for a list or a table row where the row already says what it is. Give it an <code>aria-label</code>.
      </p>
      <ComponentDemo label="Bare box example" preview={<CheckboxInvoices />} code={code("checkbox-invoices.tsx", "bare box example code")} />

      <h2 id="props">Props</h2>
      <PropsReference label="Checkbox props" props={PROPS} />
      <p className="s-small">
        For several choices that answer one question, use Checkbox group. Built on <a href="https://base-ui.com/react/components/checkbox">Base UI Checkbox</a>; its other props pass through.
      </p>
    </DocPage>
  )
}

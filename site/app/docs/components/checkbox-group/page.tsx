import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { CheckboxGroupPriceList, CheckboxGroupParty } from "@site/components/input-previews"

const ITEM = "checkbox-group"

export const metadata = componentMetadata("Checkbox group", "A React checkbox group: several choices answering one question in one frame, with an optional All row that counts what is checked. On Base UI.", "checkbox-group")

const IMPORT = `import { CheckboxGroup } from "@/components/keyline/ui/checkbox-group"`

const USAGE = `<CheckboxGroup
  legend="Send the new price list to"
  selectAll="All of sales"
  options={[
    { value: "dwight", label: "Dwight Schrute", meta: "41" },
    { value: "jim", label: "Jim Halpert", meta: "33" },
  ]}
  value={to}
  onValueChange={setTo}
/>`

const PROPS: Prop[] = [
  { name: "legend", type: "ReactNode", default: "—", description: "The question the group answers. Required." },
  { name: "options", type: "{ value, label, description?, meta?, disabled? }[]", default: "[]", description: <><code>meta</code> is a cell at the end of the row, for a count or a price.</> },
  { name: "value", type: "string[]", default: "—", description: <>The checked values, with <code>onValueChange</code>. Or start with <code>defaultValue</code>.</> },
  { name: "selectAll", type: "boolean | ReactNode", default: "—", description: "Adds a row that checks or clears every enabled option. It shows a bar while some are checked, and counts them." },
  { name: "name", type: "string", default: "—", description: <>Puts the checked values in the <code>Form</code> values under this name.</> },
  { name: "validate", type: "(value: string[]) => string | null", default: "—", description: "Return a message to fail, such as when nothing is checked." },
  { name: "layout", type: '"control" | "cell"', default: '"control"', description: <><code>cell</code> drops the frame and hides the legend, for rows inside a panel or popover.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Examples", items: [{ id: "in-a-form", label: "In a form" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function CheckboxGroupPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Checkbox group" toc={TOC}>
      <h1>Checkbox group</h1>
      <p className="s-doc-lede">
        Several choices that answer one question, in one frame. An All row sits above a 2px rule and shows how many are checked; disabled rows keep their state.
      </p>

      <ComponentDemo label="Checkbox group example" preview={<CheckboxGroupPriceList />} code={code("checkbox-group-price-list.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="in-a-form">In a form</h3>
      <p>
        With a <code>name</code>, the checked values go to <code>onFormSubmit</code>. Submit with nothing checked to see <code>validate</code> fail.
      </p>
      <ComponentDemo label="Form example" preview={<CheckboxGroupParty />} code={code("checkbox-group-party.tsx", "form example code")} />

      <h2 id="props">Props</h2>
      <PropsReference label="Checkbox group props" props={PROPS} />
      <p className="s-small">
        Also exported: <code>CheckboxGroupItem</code>, for a row the options can&apos;t describe. Tab visits each box and Space toggles it. Built on{" "}
        <a href="https://base-ui.com/react/components/checkbox-group">Base UI Checkbox Group</a>.
      </p>
    </DocPage>
  )
}

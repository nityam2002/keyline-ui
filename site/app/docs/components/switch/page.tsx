import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { SwitchAlerts } from "@site/components/input-previews"

const ITEM = "switch"

export const metadata = componentMetadata("Switch", "A React switch for settings that apply at once. On and off differ in position, shape and mark, not colour alone. On Base UI.", "switch")

const IMPORT = `import { SwitchField } from "@/components/keyline/ui/switch"`

const USAGE = `<SwitchField
  label="Email me when a client reorders"
  description="One email a day, at 8 AM."
  checked={reorder}
  onCheckedChange={setReorder}
/>`

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: <>On <code>SwitchField</code>: the setting&apos;s name. The whole row flips the switch.</> },
  { name: "description", type: "ReactNode", default: "—", description: "A line under the label, read out with it." },
  { name: "checked", type: "boolean", default: "—", description: <>With <code>onCheckedChange</code>. Or start with <code>defaultChecked</code>.</> },
  { name: "disabled", type: "boolean", default: "false", description: "For a setting someone else controls. Say who in the description." },
  { name: "layout", type: '"control" | "cell"', default: '"control"', description: <><code>cell</code> is a row inside another frame, such as a panel.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function SwitchPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Switch" toc={TOC}>
      <h1>Switch</h1>
      <p className="s-doc-lede">
        A setting that takes effect the moment it changes. On and off differ in position, a hollow or solid thumb and a mark, never colour alone. In a form that waits for Save, use a checkbox.
      </p>

      <ComponentDemo label="Switch example" preview={<SwitchAlerts />} code={code("switch-alerts.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Switch props" props={PROPS} />
      <p className="s-small">
        Also exported: <code>Switch</code>, the bare control; give it an <code>aria-label</code>. Built on <a href="https://base-ui.com/react/components/switch">Base UI Switch</a>; its other props pass through.
      </p>
    </DocPage>
  )
}

import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { SplitButtonDelivery, SplitButtonExport } from "@site/components/action-previews"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"

const ITEM = "split-button"

export const metadata = componentMetadata("Split button", "A React split button on Base UI: the usual action and its alternatives in one frame. One press runs the action; the caret opens a menu docked to the frame.", "split-button")

const IMPORT = `import { MenuItem } from "@/components/keyline/ui/menu"
import { SplitButton, SplitButtonAction, SplitButtonMenu } from "@/components/keyline/ui/split-button"`

const USAGE = `<SplitButton variant="primary">
  <SplitButtonAction onClick={book}>Book delivery</SplitButtonAction>
  <SplitButtonMenu label="Other ways to deliver">
    <MenuItem onClick={bookTomorrow}>Tomorrow morning</MenuItem>
  </SplitButtonMenu>
</SplitButton>`

const PROPS: Prop[] = [
  { name: "variant", type: '"secondary" | "primary"', default: '"secondary"', description: "Primary floods both cells cobalt." },
  { name: "layout", type: '"control" | "cell"', default: '"control"', description: <><code>cell</code> drops the frame, for a split button inside a bar or a panel footer.</> },
  { name: "label", type: "string", default: "required", description: <>On <code>SplitButtonMenu</code>: the caret&rsquo;s accessible name. Say what the menu holds.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Examples", items: [{ id: "remembered", label: "Remember the last choice" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function SplitButtonPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Split button" toc={TOC}>
      <h1>Split button</h1>
      <p className="s-doc-lede">
        The usual action and its alternatives in one frame. The action runs with one press; the caret opens a menu that docks to the whole frame.
      </p>

      <ComponentDemo label="Split button example" preview={<SplitButtonDelivery />} code={code("split-button-delivery.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <p>The menu&rsquo;s rows are Menu&rsquo;s, which the split button installs with it.</p>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="remembered">Remember the last choice</h3>
      <p>The action can repeat whatever was chosen from the menu last, so the second export is one press.</p>
      <ComponentDemo label="Remembered choice example" preview={<SplitButtonExport />} code={code("split-button-export.tsx", "export example code")} />

      <h2 id="props">Props</h2>
      <PropsReference label="Split button props" props={PROPS} />
      <p className="s-small">
        Parts: <code>SplitButton</code>, <code>SplitButtonAction</code> (a <code>button</code>; its props pass through), <code>SplitButtonMenu</code>. The menu is{" "}
        <a href="https://base-ui.com/react/components/menu">Base UI Menu</a>.
      </p>
    </DocPage>
  )
}

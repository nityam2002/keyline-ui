import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { PanelTargets, PanelGridBoard } from "@site/components/layout-previews"

const ITEM = "panel"

export const metadata = componentMetadata("Panel", "A React panel: a region of a screen in a 3px frame, with header, body and footer cells on shared keylines and footer actions as cells.", "panel")

const IMPORT = `import { Panel, PanelBody, PanelFooter, PanelGrid, PanelHeader } from "@/components/keyline/ui/panel"`

const USAGE = `<Panel>
  <PanelHeader code="Q4" title="Sales targets" />
  <PanelBody>…</PanelBody>
  <PanelFooter>
    <Button layout="cell" variant="primary">Send to corporate</Button>
  </PanelFooter>
</Panel>`

const PROPS: Prop[] = [
  { name: "layout", type: "\"control\" | \"cell\"", default: "\"control\"", description: <>On <code>Panel</code>: <code>cell</code> drops its frame to sit in a PanelGrid or another frame.</> },
  { name: "title \u00b7 code \u00b7 description \u00b7 actions", type: "ReactNode", default: "\u2014", description: <>On <code>PanelHeader</code>: <code>code</code> sits before the title; <code>actions</code> are cells at the end.</> },
  { name: "headingLevel", type: "2 | 3 | 4", default: "2", description: <>On <code>PanelHeader</code>: the title&apos;s heading level.</> },
  { name: "flush", type: "boolean", default: "false", description: <>On <code>PanelBody</code>: no padding, for lists and tables that bring their own keylines.</> },
  { name: "min", type: "number", default: "240", description: <>On <code>PanelGrid</code>: the narrowest a cell gets before the grid wraps, in pixels.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "one-frame-for-a-board", label: "One frame for a board" }, { id: "props", label: "Props" }] },
]

export default function PanelPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Panel" toc={TOC}>
      <h1>Panel</h1>
      <p className="s-doc-lede">
        A region of a screen in a 3px frame. Its header, body and footer are cells stacked on shared keylines, and the footer&apos;s actions are cells too. Standalone panels sit one gutter apart.
      </p>

      <ComponentDemo label="Panel example" preview={<PanelTargets />} code={code("panel-targets.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="one-frame-for-a-board">One frame for a board</h3>
      <p>
        Inside <code>PanelGrid</code>, panels with <code>layout=&quot;cell&quot;</code> become cells of one frame, so a dashboard reads as one instrument. The seams stay right however the grid wraps; <code>min</code> sets the narrowest cell.
      </p>
      <ComponentDemo label="One frame for a board example" preview={<PanelGridBoard />} code={code("panel-grid.tsx", "one frame for a board example code")} />


      <h2 id="props">Props</h2>
      <PropsReference label="Panel props" props={PROPS} />
      <p className="s-small">
        Resizable, Scroll area and Item pages put their content in a Panel body with <code>flush</code>.
      </p>
    </DocPage>
  )
}

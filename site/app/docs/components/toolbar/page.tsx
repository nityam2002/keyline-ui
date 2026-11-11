import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { ToolbarEditorExample, ToolbarPanelExample, ToolbarVerticalExample, ToolbarScrollExample } from "@site/components/toolbar-preview"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"

export const metadata = componentMetadata("Toolbar", "A React toolbar: a row of commands in one frame and one Tab stop. At narrow widths, secondary controls move into a More menu and keep their state. On Base UI.", "toolbar")

const IMPORT = `import {
  Toolbar,
  ToolbarButton,
  ToolbarToggle,
} from "@/components/keyline/ui/toolbar"`

const USAGE = `<Toolbar aria-label="Order actions" overflow="menu">
  <ToolbarButton primary>Refresh</ToolbarButton>
  <ToolbarToggle>Overdue only</ToolbarToggle>
</Toolbar>`

const PROPS: Prop[] = [
  {
    name: "overflow",
    type: '"scroll" | "menu"',
    default: '"scroll"',
    description: (
      <>
        <code>menu</code> moves the items that don&rsquo;t fit into a More menu, with their state. The primary button stays in the row.
      </>
    ),
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the toolbar&rsquo;s own frame, for use inside a TableFrame or Panel.
      </>
    ),
  },
  { name: "overflowLabel", type: "string", default: '"More"', description: "Accessible name of the overflow item; its menu says how many items it holds." },
  {
    name: "overflowTrigger",
    type: '"icon" | "label"',
    default: '"icon"',
    description: (
      <>
        <code>label</code> shows the overflow label as text with a caret, for a row whose items may all move into it.
      </>
    ),
  },
  { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Direction of the row." },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  {
    label: "Examples",
    items: [
      { id: "in-a-panel", label: "In a panel" },
      { id: "vertical", label: "Vertical" },
      { id: "scroll", label: "Scroll" },
    ],
  },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

/* A sheet in Keyline's AppShell: the component index beside the reading, the page's own index at its end. */
export default function ToolbarPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Toolbar" toc={TOC}>
      <h1>Toolbar</h1>
      <p className="s-doc-lede">
        A row of commands in one frame. At narrow widths, secondary controls move into a More menu and keep their state.
      </p>

      <ComponentDemo widths label="Toolbar example" preview={<ToolbarEditorExample />} code={code("toolbar-editor.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item="toolbar" />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="in-a-panel">In a panel</h3>
      <p>
        With <code>layout=&quot;cell&quot;</code> the toolbar is the top row of a <code>Panel</code>: a search input, a menu of checkbox and radio
        items, a separator and a link, on one seam with the content below.
      </p>
      <ComponentDemo label="Panel example" preview={<ToolbarPanelExample />} code={code("toolbar-panel.tsx", "panel example code")} />

      <h3 id="vertical">Vertical</h3>
      <p>
        <code>orientation=&quot;vertical&quot;</code> makes a tool palette: an exclusive choice of tool, then zoom. Up and Down arrows move between
        items.
      </p>
      <ComponentDemo label="Vertical example" preview={<ToolbarVerticalExample />} code={code("toolbar-vertical.tsx", "vertical example code")} />

      <h3 id="scroll">Scroll</h3>
      <p>
        The default overflow. Items that don&rsquo;t fit stay in the row, which scrolls inside its frame and fades the hidden edge. Arrow keys bring the focused item into view.
      </p>
      <ComponentDemo widths label="Scroll example" preview={<ToolbarScrollExample />} code={code("toolbar-scroll.tsx", "scroll example code")} />

      <h2 id="props">Props</h2>
      <PropsReference label="Toolbar props" props={PROPS} />
      <p className="s-small">
        Items: <code>ToolbarButton</code>, <code>ToolbarToggle</code>, <code>ToolbarToggleGroup</code>, <code>ToolbarSeparator</code>,{" "}
        <code>ToolbarMenu</code>, <code>ToolbarLink</code>, <code>ToolbarInput</code>. Built on{" "}
        <a href="https://base-ui.com/react/components/toolbar">Base UI Toolbar</a>.
      </p>
    </DocPage>
  )
}

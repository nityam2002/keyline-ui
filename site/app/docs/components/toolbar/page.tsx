import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import {
  ToolbarEditorExample,
  ToolbarPanelExample,
  ToolbarVerticalExample,
  ToolbarScrollExample,
} from "@site/components/toolbar-preview";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";

export const metadata = componentMetadata(
  "Toolbar",
  "A React toolbar: a row of commands in one frame and one Tab stop. At narrow widths, secondary controls move into a More menu and keep their state. On Base UI.",
  "toolbar",
);

const IMPORT = `import {
  Toolbar,
  ToolbarButton,
  ToolbarToggle,
} from "@/components/keyline/ui/toolbar"`;

const USAGE = `<Toolbar aria-label="Order actions" overflow="menu">
  <ToolbarButton primary>Refresh</ToolbarButton>
  <ToolbarToggle>Overdue only</ToolbarToggle>
</Toolbar>`;

const PROPS: Prop[] = [
  {
    name: "overflow",
    type: '"scroll" | "menu"',
    default: '"scroll"',
    description: (
      <>
        <code>menu</code> moves the items that don&rsquo;t fit into a More menu, with their state. The primary button
        stays in the row.
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
  {
    name: "overflowLabel",
    type: "string",
    default: '"More"',
    description: "Accessible name of the overflow item; its menu says how many items it holds.",
  },
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
  {
    name: "orientation",
    type: '"horizontal" | "vertical"',
    default: '"horizontal"',
    description: "Direction of the row.",
  },
];

const TOC: TocGroup[] = [
  {
    label: "Setup",
    items: [
      { id: "installation", label: "Installation" },
      { id: "usage", label: "Usage" },
    ],
  },
  {
    label: "Examples",
    items: [
      { id: "in-a-panel", label: "In a panel" },
      { id: "vertical", label: "Vertical" },
      { id: "scroll", label: "Scroll" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

/* A sheet in Keyline's AppShell: the component index beside the reading, the page's own index at its end. */
export default function ToolbarPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Toolbar" toc={TOC}>
      <h1>Toolbar</h1>
      <p className="s-doc-lede">
        A row of commands in one frame. At narrow widths, secondary controls move into a More menu and keep their state.
      </p>

      <ComponentDemo
        widths
        label="Toolbar example"
        preview={<ToolbarEditorExample />}
        code={code("toolbar-editor.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item="toolbar" />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="in-a-panel">In a panel</h3>
      <p>
        With <code>layout=&quot;cell&quot;</code> the toolbar is the top row of a <code>Panel</code>: a search input, a
        menu of checkbox and radio items, a separator and a link, on one seam with the content below.
      </p>
      <ComponentDemo
        label="Panel example"
        preview={<ToolbarPanelExample />}
        code={code("toolbar-panel.tsx", "panel example code")}
      />

      <h3 id="vertical">Vertical</h3>
      <p>
        <code>orientation=&quot;vertical&quot;</code> makes a tool palette: an exclusive choice of tool, then zoom. Up
        and Down arrows move between items.
      </p>
      <ComponentDemo
        label="Vertical example"
        preview={<ToolbarVerticalExample />}
        code={code("toolbar-vertical.tsx", "vertical example code")}
      />

      <h3 id="scroll">Scroll</h3>
      <p>
        The default overflow. Items that don&rsquo;t fit stay in the row, which scrolls inside its frame and fades the
        hidden edge. Arrow keys bring the focused item into view.
      </p>
      <ComponentDemo
        widths
        label="Scroll example"
        preview={<ToolbarScrollExample />}
        code={code("toolbar-scroll.tsx", "scroll example code")}
      />

      <h2 id="props">Props</h2>
      <PropsReference label="Toolbar props" props={PROPS} />
      <p className="s-small">
        Built on <a href="https://base-ui.com/react/components/toolbar">Base UI Toolbar</a>.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>ToolbarRoot</code> (also exported as <code>Toolbar</code>),{" "}
        <code>ToolbarButton</code>, <code>ToolbarLink</code>, <code>ToolbarInput</code>, <code>ToolbarGroup</code> and{" "}
        <code>ToolbarSeparator</code>. Keyline adds <code>ToolbarToggle</code>, <code>ToolbarToggleGroup</code>,{" "}
        <code>ToolbarSpacer</code>, and <code>ToolbarMenu</code> with <code>ToolbarMenuTrigger</code> and{" "}
        <code>ToolbarMenuContent</code>. A <code>className</code> or <code>style</code> may be a function of the
        part&apos;s state. <code>ToolbarInput</code> takes <code>className</code> for its cell and{" "}
        <code>inputClassName</code> for the input.
      </p>
      <p>
        With <code>overflow=&quot;menu&quot;</code>, items are found by what they render, not by how you write them: a{" "}
        <code>ToolbarButton</code> inside a <code>Tooltip</code>, or a component of yours that renders a{" "}
        <code>ToolbarGroup</code>, moves into More like any other item. An item in More stays mounted (hidden) in the
        row, so its state is kept.
      </p>
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>toolbar</code>, <code>toolbar-button</code>,{" "}
        <code>toolbar-toggle</code>, <code>toolbar-toggle-group</code>, <code>toolbar-link</code>,{" "}
        <code>toolbar-input-cell</code> and <code>toolbar-input</code>, <code>toolbar-group</code>,{" "}
        <code>toolbar-separator</code>, <code>toolbar-spacer</code>, <code>toolbar-menu-trigger</code>; the More item is{" "}
        <code>toolbar-more</code>; inside items, <code>toolbar-label</code> and <code>toolbar-affix</code>), and Base
        UI&apos;s state attributes: <code>data-orientation</code>, <code>data-disabled</code>, <code>data-pressed</code>{" "}
        on toggles, and <code>aria-expanded</code> on a menu trigger while its menu is open.
      </p>
    </DocPage>
  );
}

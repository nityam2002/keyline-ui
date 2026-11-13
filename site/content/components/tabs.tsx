import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { TabsAccount, TabsViews } from "@site/components/nav-previews";

const IMPORT = `import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/keyline/ui/tabs"`;

const USAGE = `<Tabs defaultValue="overview">
  <TabsList aria-label="Lackawanna County">
    <TabsTab value="overview">Overview</TabsTab>
    <TabsTab value="orders" count={3}>Orders</TabsTab>
  </TabsList>
  <TabsPanel value="overview">…</TabsPanel>
  <TabsPanel value="orders">…</TabsPanel>
</Tabs>`;

const PROPS: Prop[] = [
  {
    name: "value \u00b7 defaultValue",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>Tabs</code>: the chosen tab, controlled with <code>onValueChange</code>, or where it starts.
      </>
    ),
  },
  {
    name: "count",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        On <code>TabsTab</code>: how many the view holds, in the count voice.
      </>
    ),
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        On <code>TabsList</code>: <code>cell</code> sits inside another frame, as in a table.
      </>
    ),
  },
  {
    name: "activateOnFocus",
    type: "boolean",
    default: "true",
    description: (
      <>
        On <code>TabsList</code>: false makes arrows move focus only, and Enter or Space choose. Use it when a view is
        slow to load.
      </>
    ),
  },
  {
    name: "aria-label",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>TabsList</code>: what the tabs are views of.
      </>
    ),
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
    label: "Reference",
    items: [
      { id: "views-without-panels", label: "Views without panels" },
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "React tabs, with panels or without, under a band that stretches to the chosen tab. Arrow keys move and choose; a row that doesn't fit scrolls. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        Views of one place. The chosen tab sits under a cobalt band that stretches across to it, leading edge first. The
        arrow keys move and choose at once, as in a view switcher. A row that doesn&apos;t fit scrolls sideways and
        marks its hidden edge.
      </p>

      <ComponentDemo label="Tabs example" preview={<TabsAccount />} code={code("tabs-account.tsx", "example code")} />
    </>
  ),
  usage: (
    <>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: (
    <>
      <h2 id="examples">Examples</h2>

      <h3 id="views-without-panels">Views without panels</h3>
      <p>
        Leave out <code>TabsPanel</code> and control <code>value</code> to switch what one list shows.{" "}
        <code>count</code> puts how many each view holds under its label.
      </p>
      <ComponentDemo
        label="Views without panels example"
        preview={<TabsViews />}
        code={code("tabs-views.tsx", "views without panels example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Built on <a href="https://base-ui.com/react/components/tabs">Base UI Tabs</a>; its other props pass through. For
        an app&apos;s sections use Nav; for pages of a site, Navigation menu.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>TabsRoot</code> (also exported as <code>Tabs</code>),{" "}
        <code>TabsList</code>, <code>TabsTab</code> and <code>TabsPanel</code>. Every part takes <code>render</code>,
        and a <code>className</code> or <code>style</code> that may be a function of its state.
      </p>
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>tabs</code>, <code>tabs-list</code>,{" "}
        <code>tabs-tab</code>, <code>tabs-panel</code>; inside a tab, <code>tabs-tab-label</code> and{" "}
        <code>tabs-tab-count</code>), and Base UI&apos;s state attributes: <code>data-active</code> on the chosen tab,{" "}
        <code>data-disabled</code>, <code>data-orientation</code> and <code>data-activation-direction</code>. A tab with
        a <code>count</code> carries <code>data-has-count</code>.
      </p>
    </>
  ),
};

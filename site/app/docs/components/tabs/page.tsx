import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { TabsAccount, TabsViews } from "@site/components/nav-previews";

const ITEM = "tabs";

export const metadata = componentMetadata(
  "Tabs",
  "React tabs, with panels or without, under a band that stretches to the chosen tab. Arrow keys move and choose; a row that doesn't fit scrolls. On Base UI.",
  "tabs",
);

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
    ],
  },
];

export default function TabsPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Tabs" toc={TOC}>
      <h1>Tabs</h1>
      <p className="s-doc-lede">
        Views of one place. The chosen tab sits under a cobalt band that stretches across to it, leading edge first. The
        arrow keys move and choose at once, as in a view switcher. A row that doesn&apos;t fit scrolls sideways and
        marks its hidden edge.
      </p>

      <ComponentDemo label="Tabs example" preview={<TabsAccount />} code={code("tabs-account.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

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

      <h2 id="props">Props</h2>
      <PropsReference label="Tabs props" props={PROPS} />
      <p className="s-small">
        Built on <a href="https://base-ui.com/react/components/tabs">Base UI Tabs</a>; its other props pass through. For
        an app&apos;s sections use Nav; for pages of a site, Navigation menu.
      </p>
    </DocPage>
  );
}

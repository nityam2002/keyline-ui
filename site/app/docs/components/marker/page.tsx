import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { MarkerActivity } from "@site/components/data-previews";

const ITEM = "marker";

export const metadata = componentMetadata(
  "Marker",
  "A React activity timeline marker: a step as a glyph and words, a divider between days, a heading over a run of steps, or work still in progress.",
  "marker",
);

const IMPORT = `import { Marker, MarkerContent, MarkerIcon } from "@/components/keyline/ui/marker"`;

const USAGE = `<Marker variant="separator">
  <MarkerContent>Today</MarkerContent>
</Marker>
<Marker pending={picking}>
  <MarkerIcon>{TruckIcon}</MarkerIcon>
  <MarkerContent>Darryl's team is picking 120 cases…</MarkerContent>
</Marker>`;

const PROPS: Prop[] = [
  {
    name: "variant",
    type: '"default" | "separator" | "border"',
    default: '"default"',
    description: <>A step; words between two seams, such as a day; or a heading with a keyline under it.</>,
  },
  {
    name: "pending",
    type: "boolean",
    default: "false",
    description:
      "Work in progress. The marker becomes a polite status, so the change is announced. Remove it when the step is done.",
  },
  {
    name: "MarkerIcon",
    type: "ReactNode",
    default: "\u2014",
    description: "A 16px glyph cell, hidden from screen readers.",
  },
  { name: "MarkerContent", type: "ReactNode", default: "\u2014", description: "The words." },
];

const TOC: TocGroup[] = [
  {
    label: "Setup",
    items: [
      { id: "installation", label: "Installation" },
      { id: "usage", label: "Usage" },
    ],
  },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function MarkerPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Marker" toc={TOC}>
      <h1>Marker</h1>
      <p className="s-doc-lede">
        A step in an activity timeline or between messages, in the code voice. A glyph and words, a divider between
        days, a heading over a run of steps, or work still going. Pending runs the yellow segment under the words, never
        a spinner.
      </p>

      <ComponentDemo
        label="Marker example"
        preview={<MarkerActivity />}
        code={code("marker-activity.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Marker props" props={PROPS} />
      <p className="s-small">
        A marker is a <code>div</code>; a separator marker has the separator role.
      </p>
    </DocPage>
  );
}

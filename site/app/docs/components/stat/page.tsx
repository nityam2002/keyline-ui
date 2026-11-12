import Link from "next/link";
import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { StatSales, StatWarehouse } from "@site/components/data-previews";

const ITEM = "stat";

export const metadata = componentMetadata(
  "Stat and meter",
  "React stat and meter components: a metric with its unit and change in arrows and words, and a meter that measures a quantity against a limit.",
  "stat",
);

const IMPORT = `import { Meter, Stat } from "@/components/keyline/ui/stat"`;

const USAGE = `<Stat
  label="Paper sold"
  value="19,880"
  unit="REAMS"
  delta={{ value: "9%", direction: "up", tone: "good", label: "up 9% on Q3" }}
/>
<Meter label="Warehouse floor, pallets" value={88} max={120} high={100} />`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "\u2014", description: "What is measured." },
  {
    name: "value",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        The figure, formatted. A <code>Skeleton shape=&quot;value&quot;</code> while it loads.
      </>
    ),
  },
  {
    name: "unit",
    type: "ReactNode",
    default: "\u2014",
    description: "In the code voice beside the figure: REAMS, %, PLT.",
  },
  {
    name: "delta",
    type: "{ value, direction, tone?, label? }",
    default: "\u2014",
    description: (
      <>
        The change. <code>direction</code> is up, down or flat; <code>tone</code> says whether that is good.{" "}
        <code>label</code> is what a screen reader hears.
      </>
    ),
  },
  {
    name: "meter",
    type: "{ value, max?, label? }",
    default: "\u2014",
    description: "A meter under the figure, with its label hidden because the stat already says it.",
  },
  {
    name: "high",
    type: "number",
    default: "\u2014",
    description: (
      <>
        On <code>Meter</code>: past this value it turns red.
      </>
    ),
  },
  {
    name: "hideLabel",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>Meter</code>: only when the text beside it already gives the label and value.
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
      { id: "meter-limit", label: "Meter with a limit" },
      { id: "props", label: "Props" },
    ],
  },
];

export default function StatPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Stat and meter" toc={TOC}>
      <h1>Stat and meter</h1>
      <p className="s-doc-lede">
        Stat is one figure with its label, unit and change. The change is an arrow and words, and turns red only when
        its tone is bad. Meter measures a quantity against a limit; it is not for a task in progress, which is{" "}
        <Link href="/docs/components/progress">Progress</Link>.
      </p>

      <ComponentDemo
        label="Stat and meter example"
        preview={<StatSales />}
        code={code("stat-sales.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="meter-limit">Meter with a limit</h3>
      <p>
        <code>high</code> marks the level that needs attention. Past it, the fill and the figure turn red, and the words
        beside it say what to do.
      </p>
      <ComponentDemo
        label="Meter with a limit example"
        preview={<StatWarehouse />}
        code={code("stat-warehouse.tsx", "meter with a limit example code")}
      />

      <h2 id="props">Props</h2>
      <PropsReference label="Stat and meter props" props={PROPS} />
      <p className="s-small">
        A stat has no frame and no width of its own: set stats in a row inside a panel, and they share it. The meter is
        built on <a href="https://base-ui.com/react/components/meter">Base UI Meter</a>.
      </p>
    </DocPage>
  );
}

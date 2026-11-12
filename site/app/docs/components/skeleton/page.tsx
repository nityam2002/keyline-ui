import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { SkeletonClient } from "@site/components/data-previews";

const ITEM = "skeleton";

export const metadata = componentMetadata(
  "Skeleton",
  "React loading skeletons the size of the content on its way, inside a group that tells screen readers once what is loading. Still under reduced motion.",
  "skeleton",
);

const IMPORT = `import { Skeleton, SkeletonGroup } from "@/components/keyline/ui/skeleton"`;

const USAGE = `<SkeletonGroup label="Loading Lackawanna County" busy={loading}>
  {loading ? <Skeleton lines={3} /> : <p>{notes}</p>}
</SkeletonGroup>`;

const PROPS: Prop[] = [
  {
    name: "label",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>SkeletonGroup</code>: announced once while busy.
      </>
    ),
  },
  {
    name: "busy",
    type: "boolean",
    default: "true",
    description: (
      <>
        On <code>SkeletonGroup</code>: marks the region busy. Set it to false when the content lands.
      </>
    ),
  },
  {
    name: "shape",
    type: '"line" | "block" | "value" | "control"',
    default: '"line"',
    description: <>A run of text, an area, a figure in the count voice, or a control&apos;s frame.</>,
  },
  {
    name: "lines",
    type: "number",
    default: "1",
    description: (
      <>
        For <code>line</code>: stacks several, the last one shorter.
      </>
    ),
  },
  { name: "width", type: "CSS length", default: "by shape", description: "Size it to the real content." },
  {
    name: "height",
    type: "CSS length",
    default: "96px",
    description: (
      <>
        For <code>block</code> only.
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
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function SkeletonPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Skeleton" toc={TOC}>
      <h1>Skeleton</h1>
      <p className="s-doc-lede">
        A placeholder the size of the content on its way, so nothing moves when it lands. A skeleton is hidden from
        screen readers; the group around it says once what is loading. Under reduced motion it holds still.
      </p>

      <ComponentDemo
        label="Skeleton example"
        preview={<SkeletonClient />}
        code={code("skeleton-client.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Skeleton props" props={PROPS} />
      <p className="s-small">
        Parts: <code>Skeleton</code> (a <code>span</code>) and <code>SkeletonGroup</code> (a <code>div</code>). A
        skeleton carries <code>data-slot=&quot;skeleton&quot;</code> and <code>data-shape</code> (<code>lines</code> for
        a stack, whose lines are <code>data-slot=&quot;skeleton-line&quot;</code>); the group{" "}
        <code>data-slot=&quot;skeleton-group&quot;</code> and <code>aria-busy</code> while busy. Every part takes{" "}
        <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its state.
        Lines take a fixed pattern of widths, so a skeleton looks the same on every load.
      </p>
    </DocPage>
  );
}

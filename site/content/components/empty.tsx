import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { EmptySearch, EmptyCalls } from "@site/components/data-previews";

const IMPORT = `import { Empty } from "@/components/keyline/ui/empty"`;

const USAGE = `<Empty
  live
  title="No clients match “Stamford”"
  description="Try the company, not the branch."
  actions={<Button onClick={clear}>Clear search</Button>}
/>`;

const PROPS: Prop[] = [
  {
    name: "kind",
    type: '"empty" | "error" | "start"',
    default: '"empty"',
    description: "Nothing matched, it could not load, or nothing has been made yet.",
  },
  { name: "title", type: "ReactNode", default: "\u2014", description: "What is empty, in words." },
  { name: "description", type: "ReactNode", default: "\u2014", description: "Why, and what to try." },
  {
    name: "actions",
    type: "ReactNode",
    default: "\u2014",
    description: "Buttons. The first is the way out: clear, retry or create.",
  },
  { name: "count", type: "ReactNode", default: "0, ! or +", description: "The figure in the count cell." },
  {
    name: "code",
    type: "ReactNode",
    default: "by kind",
    description: "The word under the figure: RESULTS, ERROR or NEW.",
  },
  {
    name: "live",
    type: "boolean",
    default: "false",
    description: <>Announce it when it appears. Use when it replaces what someone was looking at.</>,
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> sits inside another frame, such as a panel or table.
      </>
    ),
  },
  { name: "headingLevel", type: "2 \u2013 6", default: "3", description: "The title's heading level." },
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
      { id: "first-use-and-errors", label: "First use and errors" },
      { id: "props", label: "Props" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React empty state for no results, first use and load errors: the count, what happened and the way out, without an illustration.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A place with nothing in it, said plainly: the count, what happened and the way out. No illustration; the number
        is the picture. Below 520px of its own width the actions move under the message.
      </p>

      <ComponentDemo label="Empty example" preview={<EmptySearch />} code={code("empty-search.tsx", "example code")} />
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

      <h3 id="first-use-and-errors">First use and errors</h3>
      <p>
        <code>kind=&quot;error&quot;</code> turns the count cell red and announces itself with <code>live</code>; Retry
        fails once here, then works. <code>kind=&quot;start&quot;</code> is for a place that has nothing yet, with the
        action that makes the first thing.
      </p>
      <ComponentDemo
        label="First use and errors example"
        preview={<EmptyCalls />}
        code={code("empty-calls.tsx", "first use and errors example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Part: <code>Empty</code> (a <code>div</code>; Base UI has no empty state). It takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state (<code>kind</code>,{" "}
        <code>layout</code>). It carries <code>data-slot=&quot;empty&quot;</code>, <code>data-kind</code> and{" "}
        <code>data-kl-layout</code>; its cells are <code>empty-count</code> (with <code>empty-figure</code> and{" "}
        <code>empty-code</code>), <code>empty-content</code> (<code>empty-title</code>, <code>empty-description</code>)
        and <code>empty-actions</code>. At 520px of its own width and under, the count becomes a band across the top and
        the actions a row under the message.
      </p>
      <p className="s-small">The title is a heading, so place it where the outline expects one.</p>
    </>
  ),
};

import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import { ToggleGroupReps, ToggleGroupPanel } from "@site/components/action-previews";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";

const IMPORT = `import { ToggleGroup, ToggleGroupItem } from "@/components/keyline/ui/toggle-group"`;

const USAGE = `<ToggleGroup aria-label="Sales rep" value={reps} onValueChange={setReps}>
  <ToggleGroupItem value="Dwight" count={2}>Dwight</ToggleGroupItem>
  <ToggleGroupItem value="Jim" count={1}>Jim</ToggleGroupItem>
</ToggleGroup>`;

const PROPS: Prop[] = [
  {
    name: "value",
    type: "string[]",
    default: "—",
    description: (
      <>
        The pressed items, with <code>onValueChange</code>. Or start with <code>defaultValue</code>.
      </>
    ),
  },
  {
    name: "multiple",
    type: "boolean",
    default: "true",
    description: (
      <>
        Independent toggles. For one choice of many, Segmented reads better than <code>false</code>.
      </>
    ),
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the frame, for a group in a panel header.
      </>
    ),
  },
  {
    name: "count",
    type: "ReactNode",
    default: "—",
    description: (
      <>
        On <code>ToggleGroupItem</code>: a count after the label.
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
  { label: "Examples", items: [{ id: "in-a-panel", label: "In a panel" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React toggle group: independent toggles in one frame, each with its lamp. At narrow widths the row scrolls and shades the edge that hides items. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        Independent toggles in one frame, each with its lamp. When the row runs out of room it scrolls inside the frame
        and shades the edge that hides items.
      </p>

      <ComponentDemo
        widths
        label="Toggle group example"
        preview={<ToggleGroupReps />}
        code={code("toggle-group-reps.tsx", "example code")}
      />
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

      <h3 id="in-a-panel">In a panel</h3>
      <p>
        With <code>layout=&quot;cell&quot;</code> the group sits in a panel header and shares its keylines. Turn both
        filters on to see what the panel says when nothing matches.
      </p>
      <ComponentDemo
        label="Panel example"
        preview={<ToggleGroupPanel />}
        code={code("toggle-group-panel.tsx", "panel example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Parts: <code>ToggleGroup</code> (Base UI <code>ToggleGroup</code>) and <code>ToggleGroupItem</code> (Base UI{" "}
        <code>Toggle</code>). Every part takes <code>render</code>, and a <code>className</code> or <code>style</code>{" "}
        that may be a function of its state. The group carries <code>data-slot=&quot;toggle-group&quot;</code> and{" "}
        <code>data-kl-layout</code>; an item <code>data-slot=&quot;toggle-group-item&quot;</code> and Base UI&rsquo;s{" "}
        <code>data-pressed</code> and <code>data-disabled</code>. Tab enters the group at one item; arrow keys move
        between items. Built on <a href="https://base-ui.com/react/components/toggle-group">Base UI Toggle Group</a>.
      </p>
    </>
  ),
};

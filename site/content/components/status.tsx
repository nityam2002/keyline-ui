import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { StatusDeliveries, StatusBadges } from "@site/components/data-previews";

const IMPORT = `import { Badge, Status } from "@/components/keyline/ui/status"`;

const USAGE = `<Status kind="attention">Held: no one to sign</Status>
<Badge>DM-4111</Badge>
<Badge tone="signal">RUSH</Badge>`;

const PROPS: Prop[] = [
  {
    name: "kind",
    type: '"normal" | "waiting" | "attention" | "done" | "none"',
    default: "\u2014",
    description: (
      <>
        On <code>Status</code>: the glyph. Each kind has its own shape; the words say the rest.
      </>
    ),
  },
  {
    name: "children",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        The state in words. Say what to do when it is <code>attention</code>.
      </>
    ),
  },
  {
    name: "tone",
    type: '"plain" | "signal" | "attention"',
    default: '"plain"',
    description: (
      <>
        On <code>Badge</code>. <code>signal</code> is the only filled badge.
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
      { id: "badge-tones", label: "Badge tones" },
      { id: "props", label: "Props" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "React status and badge components: a state as a glyph and words that reads in grayscale and forced colours, and a square code badge. Only attention is red.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A state in words with a glyph whose shape carries the meaning, so it reads in grayscale and in forced colours.
        Only attention is red. Badge is a square code label in a 1px frame, never a pill.
      </p>

      <ComponentDemo
        label="Status and badge example"
        preview={<StatusDeliveries />}
        code={code("status-deliveries.tsx", "example code")}
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

      <h3 id="badge-tones">Badge tones</h3>
      <p>
        <code>plain</code> labels a code, <code>signal</code> is the one filled form for what is new or urgent, and{" "}
        <code>attention</code> marks what needs someone. Keep to one signal badge in view.
      </p>
      <ComponentDemo
        label="Badge tones example"
        preview={<StatusBadges />}
        code={code("status-badges.tsx", "badge tones example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Parts: <code>Status</code> and <code>Badge</code>. Both render a <code>span</code> and pass other props through;
        they carry <code>data-slot=&quot;status&quot;</code> with <code>data-kind</code>, and{" "}
        <code>data-slot=&quot;badge&quot;</code> with <code>data-tone</code>. Every part takes <code>render</code>, and
        a <code>className</code> or <code>style</code> that may be a function of its state. A badge holds a code or a
        short word in capitals, not a sentence.
      </p>
    </>
  ),
};

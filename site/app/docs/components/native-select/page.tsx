import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { NativeSelectTransfer } from "@site/components/input-previews";

const ITEM = "native-select";

export const metadata = componentMetadata(
  "Native select",
  "The browser's own select in a Keyline field frame, for React forms on phones and fields the browser can autofill. The open list is the operating system's.",
  "native-select",
);

const IMPORT = `import { NativeSelect } from "@/components/keyline/ui/native-select"`;

const USAGE = `<NativeSelect
  name="branch"
  label="Transfer to"
  placeholder="Choose a branch"
  required
  options={[
    { group: "New York", options: [{ value: "utica", label: "Utica" }] },
  ]}
/>`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the field. Required." },
  {
    name: "options",
    type: "({ value, label, disabled? } | { group, options })[]",
    default: "—",
    description: (
      <>
        Options, or groups of them. Or pass <code>&lt;option&gt;</code> children.
      </>
    ),
  },
  {
    name: "placeholder",
    type: "string",
    default: "—",
    description: (
      <>
        An empty first option. With <code>required</code> it can&apos;t be chosen again.
      </>
    ),
  },
  {
    name: "error",
    type: "ReactNode",
    default: "—",
    description: (
      <>
        The message when a check fails. With <code>invalid</code> it always shows.
      </>
    ),
  },
  { name: "description", type: "ReactNode", default: "—", description: "A line under the field." },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the frame and hides the label.
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

export default function NativeSelectPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Native select" toc={TOC}>
      <h1>Native select</h1>
      <p className="s-doc-lede">
        The platform&apos;s own select in a Keyline field frame. Reach for it in long forms on phones and for fields the
        browser can autofill; the open list is the operating system&apos;s.
      </p>

      <ComponentDemo
        label="Native select example"
        preview={<NativeSelectTransfer />}
        code={code("native-select-transfer.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Native select props" props={PROPS} />
      <p className="s-small">
        Single choice only: for several, use Checkbox group. For a styled list with descriptions and codes, use Select.
        Other <code>&lt;select&gt;</code> props, such as <code>autoComplete</code>, pass through.
      </p>
    </DocPage>
  );
}

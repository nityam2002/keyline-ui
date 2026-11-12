import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { ProgressUpload, ProgressPrint } from "@site/components/data-previews";

const ITEM = "progress";

export const metadata = componentMetadata(
  "Progress",
  "A React progress bar with a readout and a detail line. A failed task stays where it stopped, in red, with room to say why. On Base UI.",
  "progress",
);

const IMPORT = `import { Progress } from "@/components/keyline/ui/progress"`;

const USAGE = `<Progress
  label="Q4 sales report.xlsx to corporate"
  value={sent}
  failed={dropped}
  detail="2.9 of 4.8 MB · about 3 s left"
/>`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "\u2014", description: "What is in progress." },
  {
    name: "value",
    type: "number | null",
    default: "\u2014",
    description: (
      <>
        How far it has got. <code>null</code> while it can&apos;t be counted.
      </>
    ),
  },
  { name: "max", type: "number", default: "100", description: "The value at which it is complete." },
  {
    name: "detail",
    type: "ReactNode",
    default: "\u2014",
    description: "A line under the rail: amounts and time left, or why it failed and what to do.",
  },
  {
    name: "failed",
    type: "boolean",
    default: "false",
    description: (
      <>
        The task stopped. <code>value</code> keeps how far it got.
      </>
    ),
  },
  { name: "failedText", type: "string", default: '"Failed"', description: "The readout when failed." },
  {
    name: "hideLabel",
    type: "boolean",
    default: "false",
    description: "Only when the text around it already gives the label and figure, as in a table cell.",
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
      { id: "indeterminate", label: "Before there is a figure" },
      { id: "props", label: "Props" },
    ],
  },
];

export default function ProgressPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Progress" toc={TOC}>
      <h1>Progress</h1>
      <p className="s-doc-lede">
        How far a task has got. The fill is the pending yellow with an ink leading edge, the readout gains the done
        glyph at the end, and a failed task stays where it stopped in red. Say why it failed and what to do in the
        detail line.
      </p>

      <ComponentDemo
        label="Progress example"
        preview={<ProgressUpload />}
        code={code("progress-upload.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="indeterminate">Before there is a figure</h3>
      <p>
        <code>value={null}</code> runs the pending segment along the rail until there is something to count. Here the
        printer warms up first, then counts pages.
      </p>
      <ComponentDemo
        label="Before there is a figure example"
        preview={<ProgressPrint />}
        code={code("progress-print.tsx", "before there is a figure example code")}
      />

      <h2 id="props">Props</h2>
      <PropsReference label="Progress props" props={PROPS} />
      <p className="s-small">
        Under reduced motion the pending segment is hatched and still. Built on{" "}
        <a href="https://base-ui.com/react/components/progress">Base UI Progress</a>; <code>format</code>,{" "}
        <code>locale</code> and <code>getAriaValueText</code> pass through.
      </p>
    </DocPage>
  );
}

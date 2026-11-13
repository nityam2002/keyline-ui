import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { ProgressUpload, ProgressPrint } from "@site/components/data-previews";

const IMPORT = `import { Progress } from "@/components/keyline/ui/progress"`;

const COMPOSED = `import {
  Progress,
  ProgressDetail,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/components/keyline/ui/progress"

<Progress value={sent} aria-describedby="eta">
  <ProgressLabel>Q4 sales report.xlsx</ProgressLabel>
  <ProgressValue />
  <ProgressTrack>
    <ProgressIndicator />
  </ProgressTrack>
  <ProgressDetail id="eta">about 3 s left</ProgressDetail>
</Progress>`;

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
  {
    name: "children",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        The parts, in place of <code>label</code>, <code>detail</code> and <code>hideLabel</code>.
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
      { id: "indeterminate", label: "Before there is a figure" },
      { id: "composed", label: "Composing the parts" },
      { id: "props", label: "Props" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React progress bar with a readout and a detail line. A failed task stays where it stopped, in red, with room to say why. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
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

      <h3 id="composed">Composing the parts</h3>
      <p>
        Given <code>label</code>, Progress renders its parts itself. Pass the parts as children to arrange them or style
        one: the label and readout share the first row, and the rail and detail span it.
      </p>
      <CodeBlock code={COMPOSED} lang="tsx" copyLabel="composed example" />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Parts, named as Base UI names them: <code>Progress</code> (Base UI <code>Progress.Root</code>),{" "}
        <code>ProgressLabel</code> (<code>Progress.Label</code>), <code>ProgressValue</code> (
        <code>Progress.Value</code>, hidden from screen readers because the bar says its value),{" "}
        <code>ProgressTrack</code> (<code>Progress.Track</code>), <code>ProgressIndicator</code> (
        <code>Progress.Indicator</code>) and <code>ProgressDetail</code> (a <code>span</code>). Each carries its{" "}
        <code>data-slot</code>: <code>progress</code>, <code>progress-label</code>, <code>progress-value</code>,{" "}
        <code>progress-track</code>, <code>progress-indicator</code>, <code>progress-detail</code>. The root adds{" "}
        <code>data-failed</code> when failed, and Base UI&rsquo;s <code>data-progressing</code>,{" "}
        <code>data-complete</code> and <code>data-indeterminate</code> are on every part. Every part takes{" "}
        <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its state.
      </p>
      <p className="s-small">
        Under reduced motion the pending segment is hatched and still. Built on{" "}
        <a href="https://base-ui.com/react/components/progress">Base UI Progress</a>; <code>format</code>,{" "}
        <code>locale</code> and <code>getAriaValueText</code> pass through.
      </p>
    </>
  ),
};

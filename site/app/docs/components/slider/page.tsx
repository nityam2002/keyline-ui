import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { SliderDiscount, SliderRange } from "@site/components/input-previews";

const ITEM = "slider";

export const metadata = componentMetadata(
  "Slider",
  "A React slider, one thumb or a range, with a readout cell sized for its longest value so the frame never shifts while you drag. On Base UI.",
  "slider",
);

const IMPORT = `import { Slider } from "@/components/keyline/ui/slider"`;

const USAGE = `<Slider label="Discount" unit="%" min={0} max={15} value={pct} onValueChange={setPct} />`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the slider and every thumb. Required." },
  {
    name: "value",
    type: "number | number[]",
    default: "—",
    description: (
      <>
        Two numbers make a range with two thumbs. With <code>onValueChange</code>, or start with{" "}
        <code>defaultValue</code>.
      </>
    ),
  },
  {
    name: "min / max / step",
    type: "number",
    default: "0 / 100 / 1",
    description: "The scale. The readout is sized for its longest value.",
  },
  {
    name: "unit",
    type: "ReactNode",
    default: "—",
    description: "Printed after the value in the readout, and read out with it.",
  },
  {
    name: "format",
    type: "Intl.NumberFormatOptions",
    default: "—",
    description: (
      <>
        Formats the readout, such as currency. Pair it with <code>locale</code>.
      </>
    ),
  },
  {
    name: "showValue",
    type: "boolean",
    default: "true",
    description: "Hide the readout only when the text around it already prints the value.",
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
  { name: "description", type: "ReactNode", default: "—", description: "A line under the field, read out with it." },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the frame and hides the label, to sit inside another frame.
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
  { label: "Examples", items: [{ id: "range", label: "Range" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function SliderPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Slider" toc={TOC}>
      <h1>Slider</h1>
      <p className="s-doc-lede">
        A value on a scale, in a frame with a readout cell. The readout is sized for the longest value it can show, so
        the frame never shifts while you drag.
      </p>

      <ComponentDemo
        label="Slider example"
        preview={<SliderDiscount />}
        code={code("slider-discount.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="range">Range</h3>
      <p>
        Pass two numbers for two thumbs. The fill runs between them, and each thumb is named &ldquo;from&rdquo; or
        &ldquo;to&rdquo;. <code>format</code> prints the readout as currency.
      </p>
      <ComponentDemo
        label="Range example"
        preview={<SliderRange />}
        code={code("slider-range.tsx", "range example code")}
      />

      <h2 id="props">Props</h2>
      <PropsReference label="Slider props" props={PROPS} />
      <p className="s-small">
        Arrow keys step, Page Up and Down take a larger step, Home and End jump to the ends. In a right-to-left page the
        scale mirrors. Built on <a href="https://base-ui.com/react/components/slider">Base UI Slider</a>.
      </p>
    </DocPage>
  );
}

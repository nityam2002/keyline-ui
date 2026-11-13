import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { SliderDiscount, SliderRange } from "@site/components/input-previews";

const IMPORT = `import { Slider } from "@/components/keyline/ui/slider"`;

const USAGE = `<Slider label="Discount" unit="%" min={0} max={15} value={pct} onValueChange={setPct} />`;

const PARTS = `<SliderRoot defaultValue={12} min={0} max={40} step={0.5}>
  <SliderLabel>Axle load</SliderLabel>
  <SliderFrame>
    <SliderControl>
      <SliderTrack>
        <SliderIndicator />
        <SliderThumb aria-label="Axle load" className={(state) => (state.dragging ? "cursor-grabbing" : undefined)} />
      </SliderTrack>
    </SliderControl>
    <SliderValue />
  </SliderFrame>
</SliderRoot>`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the slider and every thumb. Required." },
  {
    name: "value",
    type: "number | number[]",
    default: "—",
    description: (
      <>
        Two numbers make a range with two thumbs. With <code>onValueChange</code>, which also gets Base UI&apos;s event
        details (the reason for the change, and the event). Or start with <code>defaultValue</code>.
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
  {
    label: "Reference",
    items: [
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React slider, one thumb or a range, with a readout cell sized for its longest value so the frame never shifts while you drag. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A value on a scale, in a frame with a readout cell. The readout is sized for the longest value it can show, so
        the frame never shifts while you drag.
      </p>

      <ComponentDemo
        label="Slider example"
        preview={<SliderDiscount />}
        code={code("slider-discount.tsx", "example code")}
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
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Arrow keys step, Page Up and Down take a larger step, Home and End jump to the ends. In a right-to-left page the
        scale mirrors. Built on <a href="https://base-ui.com/react/components/slider">Base UI Slider</a>.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>SliderRoot</code>, <code>SliderLabel</code>,{" "}
        <code>SliderControl</code>, <code>SliderTrack</code> (the rail), <code>SliderIndicator</code> (the filled run),{" "}
        <code>SliderThumb</code> and <code>SliderValue</code> (the readout). <code>SliderFrame</code> is Keyline&apos;s:
        the control frame of cells, with the ! cell at its start. <code>Slider</code> is built from them. Every part
        takes <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its
        state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> (<code>slider</code>, <code>slider-label</code>,{" "}
        <code>slider-frame</code>, <code>slider-control</code>, <code>slider-track</code>, <code>slider-indicator</code>
        , <code>slider-thumb</code>, <code>slider-value</code>; the readout&apos;s text is <code>slider-readout</code>),
        and Base UI&apos;s state attributes: <code>data-dragging</code>, <code>data-disabled</code>,{" "}
        <code>data-invalid</code> and <code>data-orientation</code>. The root has <code>data-kl-layout</code>;{" "}
        <code>Slider</code> adds <code>data-kl-rail=&quot;painted&quot;</code> when <code>railStyle</code> paints the
        rail.
      </p>
    </>
  ),
};

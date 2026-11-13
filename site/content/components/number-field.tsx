import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { NumberFieldReorder, NumberFieldPrice } from "@site/components/input-previews";

const IMPORT = `import { NumberField } from "@/components/keyline/ui/number-field"`;

const USAGE = `<NumberField label="Reorder" unit="cases" min={1} value={cases} onValueChange={setCases} />`;

const PARTS = `<NumberFieldRoot defaultValue={24} min={0} max={33}>
  <NumberFieldGroup>
    <NumberFieldDecrement aria-label="Fewer pallets" />
    <NumberFieldInput aria-label="Pallets" />
    <NumberFieldUnit>PLT</NumberFieldUnit>
    <NumberFieldIncrement aria-label="More pallets" />
  </NumberFieldGroup>
</NumberFieldRoot>`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the field. Required." },
  {
    name: "value",
    type: "number | null",
    default: "—",
    description: (
      <>
        With <code>onValueChange</code>, which also gets Base UI&apos;s event details (the reason for the change, and
        the event). Or start with <code>defaultValue</code>. Typing commits on blur or Enter.
      </>
    ),
  },
  {
    name: "min / max",
    type: "number",
    default: "—",
    description: "The stepper that would leave the range is disabled.",
  },
  {
    name: "step / largeStep",
    type: "number",
    default: "1 / 10",
    description: (
      <>
        Arrow keys take <code>step</code>; Shift with an arrow, or Page Up and Down, take <code>largeStep</code>.
      </>
    ),
  },
  {
    name: "unit",
    type: "ReactNode",
    default: "—",
    description: "A cell after the number. It labels the value and is not part of it.",
  },
  {
    name: "format",
    type: "Intl.NumberFormatOptions",
    default: "—",
    description: (
      <>
        Formats the number, such as currency or percent. Pair it with <code>locale</code>.
      </>
    ),
  },
  {
    name: "steppers",
    type: "boolean",
    default: "true",
    description: "Turn the − and + cells off where stepping makes no sense.",
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
  { label: "Examples", items: [{ id: "currency", label: "Currency" }] },
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
  seo: "A React number input with − and + cells, a unit and locale formatting. The input is the one Tab stop; arrow keys step the value. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A number in a field frame, with − and + cells and a unit. The input is the one Tab stop; the arrow keys do the
        stepping.
      </p>

      <ComponentDemo
        label="Number field example"
        preview={<NumberFieldReorder />}
        code={code("number-field-reorder.tsx", "example code")}
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

      <h3 id="currency">Currency</h3>
      <p>
        <code>format</code> takes <code>Intl.NumberFormat</code> options, so the field shows dollars while{" "}
        <code>value</code> stays a plain number. With <code>steppers</code> off, it is a typed amount.
      </p>
      <ComponentDemo
        label="Currency example"
        preview={<NumberFieldPrice />}
        code={code("number-field-price.tsx", "currency example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Home and End jump to <code>min</code> and <code>max</code>. Holding a stepper repeats. Built on{" "}
        <a href="https://base-ui.com/react/components/number-field">Base UI Number Field</a>; its other props pass
        through.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>NumberFieldRoot</code>, <code>NumberFieldGroup</code> (the
        frame, with the ! cell at its start), <code>NumberFieldDecrement</code>, <code>NumberFieldInput</code> and{" "}
        <code>NumberFieldIncrement</code>. <code>NumberFieldUnit</code> is Keyline&apos;s: the unit cell after the
        input. <code>NumberField</code> is built from them; Base UI&apos;s scrub area is not used. Every part takes{" "}
        <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> (<code>number-field-root</code>, <code>number-field-group</code>,{" "}
        <code>number-field-decrement</code>, <code>number-field-input</code>, <code>number-field-unit</code>,{" "}
        <code>number-field-increment</code>; <code>NumberField</code>&apos;s outer field is <code>number-field</code>
        ), and Base UI&apos;s state attributes: <code>data-disabled</code>, <code>data-readonly</code>,{" "}
        <code>data-required</code>, <code>data-invalid</code> and <code>data-scrubbing</code>. The group has{" "}
        <code>data-kl-layout</code>.
      </p>
    </>
  ),
};

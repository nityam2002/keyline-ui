import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { NumberFieldReorder, NumberFieldPrice } from "@site/components/input-previews";

const ITEM = "number-field";

export const metadata = componentMetadata(
  "Number field",
  "A React number input with − and + cells, a unit and locale formatting. The input is the one Tab stop; arrow keys step the value. On Base UI.",
  "number-field",
);

const IMPORT = `import { NumberField } from "@/components/keyline/ui/number-field"`;

const USAGE = `<NumberField label="Reorder" unit="cases" min={1} value={cases} onValueChange={setCases} />`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the field. Required." },
  {
    name: "value",
    type: "number | null",
    default: "—",
    description: (
      <>
        With <code>onValueChange</code>, or start with <code>defaultValue</code>. Typing commits on blur or Enter.
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
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function NumberFieldPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Number field" toc={TOC}>
      <h1>Number field</h1>
      <p className="s-doc-lede">
        A number in a field frame, with − and + cells and a unit. The input is the one Tab stop; the arrow keys do the
        stepping.
      </p>

      <ComponentDemo
        label="Number field example"
        preview={<NumberFieldReorder />}
        code={code("number-field-reorder.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

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

      <h2 id="props">Props</h2>
      <PropsReference label="Number field props" props={PROPS} />
      <p className="s-small">
        Home and End jump to <code>min</code> and <code>max</code>. Holding a stepper repeats. Built on{" "}
        <a href="https://base-ui.com/react/components/number-field">Base UI Number Field</a>; its other props pass
        through.
      </p>
    </DocPage>
  );
}

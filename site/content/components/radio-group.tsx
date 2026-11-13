import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { RadioGroupDelivery, RadioGroupPanel } from "@site/components/input-previews";

const IMPORT = `import { RadioGroup, RadioGroupItem } from "@/components/keyline/ui/radio-group"`;

const USAGE = `<RadioGroup aria-label="Delivery" value={how} onValueChange={setHow}>
  <RadioGroupItem value="truck" label="Thursday route" meta="Free" />
  <RadioGroupItem value="morning" label="Next morning" meta="" />
</RadioGroup>`;

const PARTS = `<RadioGroup aria-label="Delivery" defaultValue="road">
  <Radio value="road" className={(state) => (state.checked ? "font-semibold" : undefined)}>
    <span className="grid w-10 place-items-center">
      <RadioIndicator />
    </span>
    <span className="py-2">Road</span>
  </Radio>
  <RadioGroupItem value="rail" label="Rail" meta="€€" />
</RadioGroup>`;

const PROPS: Prop[] = [
  {
    name: "value",
    type: "string",
    default: "—",
    description: (
      <>
        The chosen item, with <code>onValueChange</code>, which also gets Base UI&apos;s event details (the reason for
        the change, and the event). Or start with <code>defaultValue</code>.
      </>
    ),
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the frame, so the rows sit in a panel.
      </>
    ),
  },
  { name: "name", type: "string", default: "—", description: "Submits the chosen value with a form." },
  {
    name: "label",
    type: "ReactNode",
    default: "—",
    description: (
      <>
        On <code>RadioGroupItem</code>: the row&apos;s name. Required.
      </>
    ),
  },
  {
    name: "description",
    type: "ReactNode",
    default: "—",
    description: (
      <>
        On <code>RadioGroupItem</code>: a line under the label, read out with it.
      </>
    ),
  },
  {
    name: "meta",
    type: "ReactNode",
    default: "—",
    description: (
      <>
        On <code>RadioGroupItem</code>: a cell at the end, for a price or a count.
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
  seo: "A React radio group of framed rows with room for a description and a price. The chosen row is ink, and the ink stretches to the next choice. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        One choice of a few, as framed rows with room for a description and a price. The chosen row is ink, and the ink
        stretches to the next choice, leading edge first.
      </p>

      <ComponentDemo
        label="Radio group example"
        preview={<RadioGroupDelivery />}
        code={code("radio-group-delivery.tsx", "example code")}
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
        With <code>layout=&quot;cell&quot;</code> the rows share the panel&apos;s keylines. The panel header names the
        choice, so the group takes an <code>aria-label</code>.
      </p>
      <ComponentDemo
        label="Panel example"
        preview={<RadioGroupPanel />}
        code={code("radio-group-panel.tsx", "panel example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Name the group with <code>aria-label</code> or <code>aria-labelledby</code>. Tab enters at the chosen row and
        arrow keys move and choose. For a short choice on one line, Segmented fits better. Built on{" "}
        <a href="https://base-ui.com/react/components/radio">Base UI Radio Group</a>.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>RadioGroup</code>, <code>RadioRoot</code> (also exported as{" "}
        <code>Radio</code>: one row) and <code>RadioIndicator</code> (the box, with its dot while chosen).{" "}
        <code>RadioGroupItem</code> is the labelled row built from them; the two mix in one group. Every part takes{" "}
        <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> (<code>radio-group</code>, <code>radio</code>,{" "}
        <code>radio-indicator</code>; a labelled row is <code>radio-group-item</code>, with{" "}
        <code>radio-group-item-box</code>, <code>-text</code>, <code>-label</code>, <code>-description</code> and{" "}
        <code>-meta</code> inside), and Base UI&apos;s state attributes: <code>data-checked</code>,{" "}
        <code>data-unchecked</code>, <code>data-disabled</code>, <code>data-readonly</code> and{" "}
        <code>data-required</code>. The row under the ink band has <code>data-kl-covered</code>; the group has{" "}
        <code>data-kl-layout</code>.
      </p>
    </>
  ),
};

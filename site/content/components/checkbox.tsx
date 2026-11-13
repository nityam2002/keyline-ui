import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { CheckboxClosing, CheckboxInvoices } from "@site/components/input-previews";

const IMPORT = `import { CheckboxField } from "@/components/keyline/ui/checkbox"`;

const USAGE = `<CheckboxField
  label="Lock the warehouse door"
  description="Darryl leaves by the loading dock at 5."
  checked={locked}
  onCheckedChange={setLocked}
/>`;

const PARTS = `<CheckboxRoot name="hazardous" aria-label="Hazardous goods" indeterminate={some}>
  <CheckboxIndicator className={(state) => (state.indeterminate ? "opacity-60" : undefined)} />
</CheckboxRoot>`;

const PROPS: Prop[] = [
  {
    name: "label",
    type: "ReactNode",
    default: "—",
    description: (
      <>
        On <code>CheckboxField</code>: the row&apos;s name. The whole row toggles the box.
      </>
    ),
  },
  { name: "description", type: "ReactNode", default: "—", description: "A line under the label, read out with it." },
  {
    name: "checked",
    type: "boolean",
    default: "—",
    description: (
      <>
        With <code>onCheckedChange</code>, which also gets Base UI&apos;s event details (the reason for the change, and
        the event). Or start with <code>defaultChecked</code>.
      </>
    ),
  },
  {
    name: "indeterminate",
    type: "boolean",
    default: "false",
    description: <>Draws a bar: some of a set is checked. Checkbox group sets it for you on its All row.</>,
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        On <code>CheckboxField</code>: <code>cell</code> is a row inside another frame, such as a panel.
      </>
    ),
  },
  { name: "name", type: "string", default: "—", description: "Submits the box with a form." },
];

const TOC: TocGroup[] = [
  {
    label: "Setup",
    items: [
      { id: "installation", label: "Installation" },
      { id: "usage", label: "Usage" },
    ],
  },
  { label: "Examples", items: [{ id: "bare", label: "Bare box" }] },
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
  seo: "A React checkbox for one yes-or-no choice, alone or as a labelled row. Checked fills the square with ink, so the state reads without colour. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A square box for one yes-or-no choice. Checked fills it with ink, so the state reads without colour.
      </p>

      <ComponentDemo
        label="Checkbox example"
        preview={<CheckboxClosing />}
        code={code("checkbox-closing.tsx", "example code")}
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

      <h3 id="bare">Bare box</h3>
      <p>
        <code>Checkbox</code> on its own, for a list or a table row where the row already says what it is. Give it an{" "}
        <code>aria-label</code>.
      </p>
      <ComponentDemo
        label="Bare box example"
        preview={<CheckboxInvoices />}
        code={code("checkbox-invoices.tsx", "bare box example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        For several choices that answer one question, use Checkbox group. Built on{" "}
        <a href="https://base-ui.com/react/components/checkbox">Base UI Checkbox</a>; its other props pass through.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>CheckboxRoot</code> (also exported as <code>Checkbox</code>;
        without children it draws its indicator) and <code>CheckboxIndicator</code> (the tick or the bar, kept mounted
        so the box never jumps). <code>CheckboxField</code> is the labelled row built from them. Every part takes{" "}
        <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> (<code>checkbox</code>, <code>checkbox-indicator</code>; the row is{" "}
        <code>checkbox-field</code>, with <code>checkbox-field-row</code>, <code>-box</code>, <code>-text</code>,{" "}
        <code>-label</code> and <code>-description</code> inside), and Base UI&apos;s state attributes:{" "}
        <code>data-checked</code>, <code>data-unchecked</code>, <code>data-indeterminate</code>,{" "}
        <code>data-disabled</code>, <code>data-readonly</code>, <code>data-required</code> and <code>data-invalid</code>
        . The row has <code>data-kl-layout</code>.
      </p>
    </>
  ),
};

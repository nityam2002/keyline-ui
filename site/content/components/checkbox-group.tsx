import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { CheckboxGroupPriceList, CheckboxGroupParty } from "@site/components/input-previews";

const IMPORT = `import { CheckboxGroup } from "@/components/keyline/ui/checkbox-group"`;

const USAGE = `<CheckboxGroup
  legend="Send the new price list to"
  selectAll="All of sales"
  options={[
    { value: "dwight", label: "Dwight Schrute", meta: "41" },
    { value: "jim", label: "Jim Halpert", meta: "33" },
  ]}
  value={to}
  onValueChange={setTo}
/>`;

const PARTS = `<CheckboxGroupRoot name="notify" defaultValue={["delayed"]} allValues={["delayed", "delivered"]}>
  <CheckboxGroupLegend>Notify me about</CheckboxGroupLegend>
  <CheckboxGroupFrame>
    <CheckboxGroupItem parent label="All events" />
    <CheckboxGroupItem value="delayed" label="Delayed" meta="12" />
    <CheckboxGroupItem value="delivered" label="Delivered" meta="48" />
  </CheckboxGroupFrame>
</CheckboxGroupRoot>`;

const PROPS: Prop[] = [
  { name: "legend", type: "ReactNode", default: "—", description: "The question the group answers. Required." },
  {
    name: "options",
    type: "{ value, label, description?, meta?, disabled? }[]",
    default: "[]",
    description: (
      <>
        <code>meta</code> is a cell at the end of the row, for a count or a price.
      </>
    ),
  },
  {
    name: "value",
    type: "string[]",
    default: "—",
    description: (
      <>
        The checked values, with <code>onValueChange</code>, which also gets Base UI&apos;s event details (the reason
        for the change, and the event). Or start with <code>defaultValue</code>.
      </>
    ),
  },
  {
    name: "selectAll",
    type: "boolean | ReactNode",
    default: "—",
    description:
      "Adds a row that checks or clears every enabled option. It shows a bar while some are checked, and counts them.",
  },
  {
    name: "name",
    type: "string",
    default: "—",
    description: (
      <>
        Puts the checked values in the <code>Form</code> values under this name.
      </>
    ),
  },
  {
    name: "validate",
    type: "(value: string[]) => string | null",
    default: "—",
    description: "Return a message to fail, such as when nothing is checked.",
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the frame and hides the legend, for rows inside a panel or popover.
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
  { label: "Examples", items: [{ id: "in-a-form", label: "In a form" }] },
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
  seo: "A React checkbox group: several choices answering one question in one frame, with an optional All row that counts what is checked. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        Several choices that answer one question, in one frame. An All row sits above a 2px rule and shows how many are
        checked; disabled rows keep their state.
      </p>

      <ComponentDemo
        label="Checkbox group example"
        preview={<CheckboxGroupPriceList />}
        code={code("checkbox-group-price-list.tsx", "example code")}
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

      <h3 id="in-a-form">In a form</h3>
      <p>
        With a <code>name</code>, the checked values go to <code>onFormSubmit</code>. Submit with nothing checked to see{" "}
        <code>validate</code> fail.
      </p>
      <ComponentDemo
        label="Form example"
        preview={<CheckboxGroupParty />}
        code={code("checkbox-group-party.tsx", "form example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Also exported: <code>CheckboxGroupItem</code>, for a row the options can&apos;t describe. Tab visits each box
        and Space toggles it. Built on{" "}
        <a href="https://base-ui.com/react/components/checkbox-group">Base UI Checkbox Group</a>.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts: <code>CheckboxGroupRoot</code> (Base UI&apos;s CheckboxGroup, as a fieldset in its own Field, so{" "}
        <code>name</code>, <code>invalid</code> and <code>validate</code> reach a Form),{" "}
        <code>CheckboxGroupLegend</code> (Base UI&apos;s Fieldset.Legend), <code>CheckboxGroupFrame</code> and{" "}
        <code>CheckboxGroupItem</code> rows (a Base UI Field.Item with a Checkbox; <code>parent</code> makes it the All
        row). <code>CheckboxGroup</code> is built from them. Every part but the row takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state; the row&apos;s{" "}
        <code>className</code> may be one too.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> (<code>checkbox-group</code>, <code>checkbox-group-legend</code>,{" "}
        <code>checkbox-group-frame</code>, <code>checkbox-group-item</code>, with <code>checkbox-group-item-row</code>,{" "}
        <code>-box</code>, <code>-text</code>, <code>-label</code>, <code>-description</code> and <code>-meta</code>{" "}
        inside), and Base UI&apos;s state attributes: <code>data-disabled</code> and <code>data-invalid</code> on the
        group and rows, and the checkbox&apos;s on each box. The parent row has <code>data-kl-parent</code>; the group
        and frame have <code>data-kl-layout</code>.
      </p>
    </>
  ),
};

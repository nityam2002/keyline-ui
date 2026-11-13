import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { ComboboxClient, ComboboxDirectory } from "@site/components/input-previews";

const IMPORT = `import { Combobox } from "@/components/keyline/ui/combobox"`;

const USAGE = `<Combobox
  label="Client"
  noun={["client", "clients"]}
  options={[
    { value: "blue-cross", label: "Blue Cross of Pennsylvania", code: "BC" },
    { value: "library", label: "Wilkes-Barre Library", code: "WBL" },
  ]}
  onValueChange={(value, option) => setClient(option)}
/>`;

const PARTS = `<ComboboxRoot items={ports}>
  <ComboboxInputGroup>
    <ComboboxInput aria-label="Port" />
    <ComboboxTrigger aria-label="Show ports" />
  </ComboboxInputGroup>
  <ComboboxPopup>
    <ComboboxEmpty>No ports match.</ComboboxEmpty>
    <ComboboxList>
      {(port: string) => <ComboboxItem key={port} value={port}>{port}</ComboboxItem>}
    </ComboboxList>
  </ComboboxPopup>
</ComboboxRoot>`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the field. Required." },
  {
    name: "options",
    type: "ComboboxOption[]",
    default: "[]",
    description: (
      <>
        <code>{"{ value, label, description?, code?, group?, disabled? }"}</code>, filtered as you type. With{" "}
        <code>loadOptions</code>, the ones shown before a search.
      </>
    ),
  },
  {
    name: "loadOptions",
    type: "(query, signal) => Promise<ComboboxOption[]>",
    default: "—",
    description: (
      <>
        An async source, called on open and on each edit. A newer search aborts the older one through{" "}
        <code>signal</code>; a rejection shows its message with Retry.
      </>
    ),
  },
  {
    name: "value",
    type: "string | null",
    default: "—",
    description: (
      <>
        The chosen option&apos;s value. <code>onValueChange</code> also gets the option and Base UI&apos;s event details
        (the reason for the change, and the event).
      </>
    ),
  },
  {
    name: "noun",
    type: "[string, string]",
    default: '["option", "options"]',
    description: "Names what is listed, in the status line and the empty state.",
  },
  { name: "clearable", type: "boolean", default: "true", description: "Shows a clear cell while something is chosen." },
  {
    name: "name",
    type: "string",
    default: "—",
    description: (
      <>
        Submits the chosen value with a form. <code>required</code> and <code>validate</code> work as on any field.
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
  { label: "Examples", items: [{ id: "async", label: "Async search" }] },
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
  seo: "A React combobox: a select you can type into, with local filtering or an async search that can fail and retry. The list docks under the field. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A select you can type into. The list docks under the field like Select&apos;s, the typed text is underlined in
        each match, and the chosen option keeps its mark.
      </p>

      <ComponentDemo
        label="Combobox example"
        preview={<ComboboxClient />}
        code={code("combobox-client.tsx", "example code")}
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

      <h3 id="async">Async search</h3>
      <p>
        With <code>loadOptions</code>, a status line in the list says what it holds: searching, how many matched, or
        what went wrong, with Retry. Search for &ldquo;stamford&rdquo; to see the error.
      </p>
      <ComponentDemo
        label="Async search example"
        preview={<ComboboxDirectory />}
        code={code("combobox-directory.tsx", "async search example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Escape closes the list. For several values, use Multiselect. Built on{" "}
        <a href="https://base-ui.com/react/components/combobox">Base UI Combobox</a>.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>Combobox</code> is built from parts you can compose yourself, named as Base UI names them:{" "}
        <code>ComboboxRoot</code>, <code>ComboboxInputGroup</code>, <code>ComboboxInput</code>,{" "}
        <code>ComboboxTrigger</code>, <code>ComboboxClear</code>, <code>ComboboxPopup</code>,{" "}
        <code>ComboboxStatus</code>, <code>ComboboxList</code>, <code>ComboboxCollection</code>,{" "}
        <code>ComboboxItem</code>, <code>ComboboxGroup</code>, <code>ComboboxGroupLabel</code>,{" "}
        <code>ComboboxEmpty</code>, and for several values <code>ComboboxChips</code>, <code>ComboboxChip</code> and{" "}
        <code>ComboboxChipRemove</code>. <code>ComboboxRoot</code> is generic over the item and <code>multiple</code>.
        The clear and chip-remove cells show only a cross, so they require an <code>aria-label</code>.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
    </>
  ),
};

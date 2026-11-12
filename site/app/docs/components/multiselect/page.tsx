import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { MultiselectMemo } from "@site/components/input-previews";

const ITEM = "multiselect";

export const metadata = componentMetadata(
  "Multiselect",
  "A React multiselect on Base UI: search and pick several values, each a token with its own remove cell. Chosen options stay listed while new matches load.",
  "multiselect",
);

const IMPORT = `import { Multiselect } from "@/components/keyline/ui/multiselect"`;

const USAGE = `<Multiselect
  label="Send the memo to"
  noun={["person", "people"]}
  loadOptions={findPeople}
  value={to}
  onValueChange={setTo}
/>`;

const PARTS = `<ComboboxRoot items={people} multiple defaultValue={[]}>
  <ComboboxInputGroup>
    <ComboboxChips>
      {chosen.map((p) => (
        <ComboboxChip key={p} aria-label={p}>
          <span>{p}</span>
          <ComboboxChipRemove aria-label={\`Remove \${p}\`} />
        </ComboboxChip>
      ))}
      <ComboboxInput aria-label="Send the memo to" />
    </ComboboxChips>
    <ComboboxTrigger aria-label="Show people" />
  </ComboboxInputGroup>
  <ComboboxPopup>
    <ComboboxList>
      {(p: string) => <ComboboxItem key={p} value={p}>{p}</ComboboxItem>}
    </ComboboxList>
  </ComboboxPopup>
</ComboboxRoot>`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the field. Required." },
  {
    name: "loadOptions",
    type: "(query, signal) => Promise<MultiselectOption[]>",
    default: "—",
    description: (
      <>
        Required. Called on open with an empty query, then on each edit; a newer search aborts the older one. For a
        fixed list, filter it here.
      </>
    ),
  },
  {
    name: "value",
    type: "MultiselectOption[]",
    default: "—",
    description: (
      <>
        The chosen options, whole: <code>{"{ value, label, description?, count?, disabled? }"}</code>. With{" "}
        <code>onValueChange</code>, which also gets Base UI&apos;s event details (the reason for the change, and the
        event). Or start with <code>defaultValue</code>.
      </>
    ),
  },
  {
    name: "noun",
    type: "[string, string]",
    default: '["item", "items"]',
    description: "Names what is listed, in the status line.",
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the frame and hides the label, for a toolbar.
      </>
    ),
  },
  { name: "placeholder", type: "string", default: '"Search…"', description: "Shown while nothing is chosen." },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Out of service: hatched, and the list won't open.",
  },
  {
    name: "container",
    type: "Element | ref",
    default: "<body>",
    description:
      "Where the list's portal renders. The list keeps the theme, density, motion and direction of the place it is written either way.",
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
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

export default function MultiselectPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Multiselect" toc={TOC}>
      <h1>Multiselect</h1>
      <p className="s-doc-lede">
        Search and pick several values. Each choice becomes a yellow token in the field with its own remove cell, and
        chosen options stay listed while new matches arrive.
      </p>

      <ComponentDemo
        label="Multiselect example"
        preview={<MultiselectMemo />}
        code={code("multiselect-memo.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Multiselect props" props={PROPS} />
      <p className="s-small">
        Backspace in an empty input removes the last token. For a short fixed list, Checkbox group shows every choice at
        once. Built on <a href="https://base-ui.com/react/components/combobox">Base UI Combobox</a>.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>Multiselect</code> is a preset over Combobox&apos;s parts with Base UI&apos;s <code>multiple</code>: the
        chips, the input, the list and Clear are <code>ComboboxChips</code>, <code>ComboboxChip</code>,{" "}
        <code>ComboboxChipRemove</code>, <code>ComboboxInput</code>, <code>ComboboxPopup</code>,{" "}
        <code>ComboboxList</code>, <code>ComboboxItem</code> and <code>ComboboxClear</code>. To build your own, install
        Combobox and compose them (placement props, <code>container</code> and <code>portalProps</code> go on{" "}
        <code>ComboboxPopup</code>):
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        The field carries <code>data-slot=&quot;multiselect&quot;</code> and Base UI Field&apos;s{" "}
        <code>data-disabled</code>; the count cell is <code>multiselect-count</code> (with <code>data-zero</code> while
        nothing is chosen), and the list&apos;s head and foot are <code>multiselect-head</code> and{" "}
        <code>multiselect-foot</code>. Everything else is Combobox&apos;s slots (<code>combobox-chip</code>,{" "}
        <code>combobox-item</code>, …) with Base UI&apos;s <code>data-selected</code>, <code>data-highlighted</code>,{" "}
        <code>data-disabled</code> and <code>data-popup-open</code>.
      </p>
    </DocPage>
  );
}

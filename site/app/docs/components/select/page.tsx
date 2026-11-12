import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { SelectAssign, SelectForm } from "@site/components/input-previews";

const ITEM = "select";

export const metadata = componentMetadata(
  "Select",
  "A React select whose list docks under its field. Options can carry a description, a code and a group, and disabled options stay readable. On Base UI.",
  "select",
);

const IMPORT = `import { Select } from "@/components/keyline/ui/select"`;

const USAGE = `<Select
  label="Assign the lead to"
  placeholder="Choose a rep"
  options={[
    { value: "dwight", label: "Dwight Schrute", code: "DS" },
    { value: "jim", label: "Jim Halpert", code: "JH" },
  ]}
  value={rep}
  onValueChange={setRep}
/>`;

const PARTS = `<Field>
  <SelectRoot items={{ jan: "Jan Levinson", david: "David Wallace" }} defaultValue="jan">
    <SelectLabel>Escalate to</SelectLabel>
    <SelectTrigger>
      <SelectValue placeholder="Nobody" />
      <SelectIcon />
    </SelectTrigger>
    <SelectPopup>
      <SelectList>
        <SelectGroup>
          <SelectGroupLabel>Corporate</SelectGroupLabel>
          <SelectItem value="jan" code="VP">Jan Levinson</SelectItem>
          <SelectItem value="david" code="CFO">David Wallace</SelectItem>
        </SelectGroup>
      </SelectList>
    </SelectPopup>
  </SelectRoot>
</Field>`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the field. Required." },
  {
    name: "options",
    type: "SelectOption[]",
    default: "—",
    description: (
      <>
        <code>{"{ value, label, description?, code?, group?, disabled? }"}</code>. Options with a <code>group</code> are
        listed under a heading.
      </>
    ),
  },
  {
    name: "value",
    type: "string | null",
    default: "—",
    description: (
      <>
        With <code>onValueChange</code>, which also gets Base UI&apos;s event details (the reason for the change, and
        the event). Or start with <code>defaultValue</code>.
      </>
    ),
  },
  { name: "placeholder", type: "ReactNode", default: '"Choose…"', description: "Shown until something is chosen." },
  {
    name: "error",
    type: "ReactNode",
    default: "—",
    description: (
      <>
        The message when a check fails, such as <code>required</code>. With <code>invalid</code> it always shows.
      </>
    ),
  },
  { name: "description", type: "ReactNode", default: "—", description: "A line under the field." },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the frame and hides the label, for a select inside another frame.
      </>
    ),
  },
  {
    name: "container",
    type: "Element | ref",
    default: "<body>",
    description:
      "Where the list's portal renders. The list keeps the theme, density, motion and direction of the place it is written either way.",
  },
  {
    name: "side \u00b7 align",
    type: "Base UI side \u00b7 align",
    default: '"bottom" \u00b7 "start"',
    description: (
      <>
        On <code>SelectPopup</code>: where the list docks. It flips when there&apos;s no room.
      </>
    ),
  },
  {
    name: "sideOffset \u00b7 alignOffset \u00b7 collisionPadding",
    type: "number",
    default: "the dock's \u00b7 the dock's \u00b7 12",
    description: (
      <>
        On <code>SelectPopup</code>: the positioner&apos;s props, lifted onto the popup. By default the list shares the
        trigger&apos;s edge.
      </>
    ),
  },
  {
    name: "alignItemWithTrigger",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>SelectPopup</code>: <code>true</code> lays the list over the trigger with the chosen row on it, as
        macOS does.
      </>
    ),
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>SelectPopup</code>: where the portal renders, and props for Base UI&apos;s portal (such as{" "}
        <code>keepMounted</code>).
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
  { label: "Examples", items: [{ id: "required", label: "Required" }] },
  {
    label: "Reference",
    items: [
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

export default function SelectPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Select" toc={TOC}>
      <h1>Select</h1>
      <p className="s-doc-lede">
        One choice from a list that docks under its field and shares its edge. The chosen option keeps its mark; the row
        under your cursor is ink. Disabled options can still be read.
      </p>

      <ComponentDemo
        label="Select example"
        preview={<SelectAssign />}
        code={code("select-assign.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="required">Required</h3>
      <p>
        In a <code>Form</code>, <code>required</code> stops the submit and shows <code>error</code> under the field.
        Choose a weight and the message goes.
      </p>
      <ComponentDemo
        label="Required example"
        preview={<SelectForm />}
        code={code("select-form.tsx", "required example code")}
      />

      <h2 id="props">Props</h2>
      <PropsReference label="Select props" props={PROPS} />
      <p className="s-small">
        Escape closes the list and keeps the value; type to jump to an option. Built on{" "}
        <a href="https://base-ui.com/react/components/select">Base UI Select</a>; its other props pass through.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        For rows the options can&apos;t describe, compose the parts, named as Base UI names them:{" "}
        <code>SelectRoot</code>, <code>SelectLabel</code>, <code>SelectTrigger</code>, <code>SelectValue</code>,{" "}
        <code>SelectIcon</code>, <code>SelectPopup</code> (Base UI&apos;s Portal, Positioner and Popup in one part),{" "}
        <code>SelectList</code>, <code>SelectItem</code> (with <code>description</code> and <code>code</code>),{" "}
        <code>SelectItemText</code>, <code>SelectItemIndicator</code>, <code>SelectGroup</code>,{" "}
        <code>SelectGroupLabel</code>, <code>SelectSeparator</code>, <code>SelectScrollUpArrow</code> and{" "}
        <code>SelectScrollDownArrow</code>. Wrap them in a <code>Field</code> for the label, messages and form state.
        Every part takes <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function
        of its state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>select-trigger</code>,{" "}
        <code>select-value</code>, <code>select-popup</code>, <code>select-item</code> and so on; the{" "}
        <code>Select</code> field is <code>select</code>), and Base UI&apos;s state attributes:{" "}
        <code>data-popup-open</code> on the trigger, <code>data-placeholder</code> on the value while nothing is chosen,{" "}
        <code>data-selected</code> and <code>data-highlighted</code> on items, <code>data-disabled</code>, and{" "}
        <code>data-side</code> and <code>data-align</code> on the popup.
      </p>
    </DocPage>
  );
}

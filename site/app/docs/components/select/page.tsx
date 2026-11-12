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
        With <code>onValueChange</code>. Or start with <code>defaultValue</code>.
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
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
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
        For rows the options can&apos;t describe, compose the parts: <code>SelectRoot</code>, <code>SelectLabel</code>,{" "}
        <code>SelectTrigger</code>, <code>SelectContent</code>, <code>SelectItem</code>, <code>SelectGroup</code> and{" "}
        <code>SelectSeparator</code>. Built on <a href="https://base-ui.com/react/components/select">Base UI Select</a>.
      </p>
    </DocPage>
  );
}

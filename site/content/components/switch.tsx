import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { SwitchAlerts } from "@site/components/input-previews";

const IMPORT = `import { SwitchField } from "@/components/keyline/ui/switch"`;

const USAGE = `<SwitchField
  label="Email me when a client reorders"
  description="One email a day, at 8 AM."
  checked={reorder}
  onCheckedChange={setReorder}
/>`;

const PARTS = `<SwitchRoot name="reorder" aria-label="Reorder when low" onCheckedChange={(on, eventDetails) => save(on)}>
  <SwitchThumb className={(state) => (state.checked ? "shadow-none" : undefined)} />
</SwitchRoot>`;

const PROPS: Prop[] = [
  {
    name: "label",
    type: "ReactNode",
    default: "—",
    description: (
      <>
        On <code>SwitchField</code>: the setting&apos;s name. The whole row flips the switch.
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
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "For a setting someone else controls. Say who in the description.",
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> is a row inside another frame, such as a panel.
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
  seo: "A React switch for settings that apply at once. On and off differ in position, shape and mark, not colour alone. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A setting that takes effect the moment it changes. On and off differ in position, a hollow or solid thumb and a
        mark, never colour alone. In a form that waits for Save, use a checkbox.
      </p>

      <ComponentDemo
        label="Switch example"
        preview={<SwitchAlerts />}
        code={code("switch-alerts.tsx", "example code")}
      />
    </>
  ),
  usage: (
    <>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: null,
  reference: (
    <>
      <p className="s-small">
        Also exported: <code>Switch</code>, the bare control; give it an <code>aria-label</code>. Built on{" "}
        <a href="https://base-ui.com/react/components/switch">Base UI Switch</a>; its other props pass through.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>SwitchRoot</code> (also exported as <code>Switch</code>;
        without children it draws its thumb) and <code>SwitchThumb</code>. <code>SwitchField</code> is the labelled row
        built from them. Every part takes <code>render</code>, and a <code>className</code> or <code>style</code> that
        may be a function of its state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> (<code>switch</code>, <code>switch-thumb</code>; the row is{" "}
        <code>switch-field</code>, with <code>switch-field-row</code>, <code>-text</code>, <code>-label</code>,{" "}
        <code>-description</code> and <code>-cell</code> inside), and Base UI&apos;s state attributes on both parts:{" "}
        <code>data-checked</code>, <code>data-unchecked</code>, <code>data-disabled</code>, <code>data-readonly</code>,{" "}
        <code>data-required</code> and <code>data-invalid</code>. The row has <code>data-kl-layout</code>.
      </p>
    </>
  ),
};

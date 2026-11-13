import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { FieldOrder, FieldTracking, FieldCarton } from "@site/components/input-previews";

const IMPORT = `import { Form, FormActions, Field, FieldLabel, FieldFrame, FieldControl, FieldError } from "@/components/keyline/ui/field"`;

const USAGE = `<Form onFormSubmit={placeOrder}>
  <Field name="client">
    <FieldLabel>Client</FieldLabel>
    <FieldFrame>
      <FieldControl required />
    </FieldFrame>
    <FieldError match="valueMissing">Who is the order for?</FieldError>
  </Field>
  <FormActions>
    <Button type="submit" variant="primary">Place order</Button>
  </FormActions>
</Form>`;

const PARTS = `<Form onFormSubmit={save}>
  <FieldRoot name="weight" validate={(v) => (Number(v) > 0 ? null : "Enter the weight")}>
    <FieldLabel>Weight</FieldLabel>
    <FieldFrame>
      <FieldControl inputMode="decimal" align="end" />
      <FieldAffix>kg</FieldAffix>
    </FieldFrame>
    <FieldDescription>Gross, with the pallet</FieldDescription>
    <FieldError />
    <FieldValidity>{(state) => (state.validity.valid ? null : <Notice>Check the scale</Notice>)}</FieldValidity>
  </FieldRoot>
  <FormActions>
    <Button type="submit" variant="primary">Save</Button>
  </FormActions>
</Form>`;

const PROPS: Prop[] = [
  {
    name: "orientation",
    type: '"vertical" | "horizontal" | "responsive"',
    default: '"vertical"',
    description: (
      <>
        On <code>Form</code> or a single <code>Field</code>. Responsive puts labels in a start column while the form is
        at least 560px wide.
      </>
    ),
  },
  {
    name: "onFormSubmit",
    type: "(values) => void",
    default: "—",
    description: (
      <>
        On <code>Form</code>: runs once every field passes, with the values keyed by each field&apos;s <code>name</code>
        .
      </>
    ),
  },
  {
    name: "errors",
    type: "Record<string, string>",
    default: "—",
    description: (
      <>
        On <code>Form</code>: messages from your server, keyed by field <code>name</code>. They show in that
        field&apos;s <code>FieldError</code>.
      </>
    ),
  },
  {
    name: "validate",
    type: "(value) => string | null",
    default: "—",
    description: (
      <>
        On <code>Field</code>: return a message to fail. Runs on submit, then as the value changes.
      </>
    ),
  },
  {
    name: "invalid",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>Field</code>: show the error state yourself, for a rule you check elsewhere.
      </>
    ),
  },
  {
    name: "match",
    type: "boolean | keyof ValidityState",
    default: "—",
    description: (
      <>
        On <code>FieldError</code>: show this message for one check only, such as <code>valueMissing</code>. Without it,
        the failed check&apos;s own message shows.
      </>
    ),
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        On <code>FieldFrame</code>: <code>cell</code> drops its border, to sit inside another frame.
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
    label: "Examples",
    items: [
      { id: "server-errors", label: "Server errors" },
      { id: "group", label: "Several parts" },
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
  title: "Field and form",
  seo: "React form fields: label, frame, description and error for any input, and a form that lines them up and validates. A failed check says what to do.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A label, a frame, a description and an error for any input, and a form that lines them up. When a check fails,
        the frame turns red, a ! cell opens at its start and the message says what to do.
      </p>

      <ComponentDemo
        widths
        label="Field and form example"
        preview={<FieldOrder />}
        code={code("field-order.tsx", "example code")}
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

      <h3 id="server-errors">Server errors</h3>
      <p>
        Pass your server&apos;s answer to <code>errors</code>, keyed by field name, and it shows under that field. The
        Track button is a <code>layout=&quot;cell&quot;</code> Button inside the frame.
      </p>
      <ComponentDemo
        label="Server errors example"
        preview={<FieldTracking />}
        code={code("field-tracking.tsx", "server errors example code")}
      />

      <h3 id="group">Several parts</h3>
      <p>
        <code>FieldGroup</code> puts several labelled inputs in one frame. A rule across them goes in{" "}
        <code>FieldGroupError</code>, and <code>invalid</code> marks the part that broke it.
      </p>
      <ComponentDemo
        label="Several parts example"
        preview={<FieldCarton />}
        code={code("field-carton.tsx", "parts example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Built on <a href="https://base-ui.com/react/components/field">Base UI Field</a>,{" "}
        <a href="https://base-ui.com/react/components/fieldset">Fieldset</a> and{" "}
        <a href="https://base-ui.com/react/components/form">Form</a>; their other props pass through.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>Form</code>, <code>FieldRoot</code> (also exported as{" "}
        <code>Field</code>), <code>FieldLabel</code>, <code>FieldControl</code>, <code>FieldDescription</code>,{" "}
        <code>FieldError</code>, <code>FieldValidity</code> (a function child with the field&apos;s validity, no
        element), <code>Fieldset</code> and <code>FieldsetLegend</code>. Keyline adds the frame and its cells:{" "}
        <code>FieldFrame</code>, <code>FieldTextarea</code> (a <code>FieldControl</code> rendering a textarea),{" "}
        <code>FieldAffix</code> for a unit or icon cell, <code>FieldBar</code> for a row across the frame, and{" "}
        <code>FormActions</code>; and for several inputs in one frame, <code>FieldGroup</code>,{" "}
        <code>FieldGroupPart</code>, <code>FieldGroupJoin</code> and <code>FieldGroupError</code>. Every part takes{" "}
        <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>form</code>, <code>field</code>,{" "}
        <code>field-label</code>, <code>field-frame</code>, <code>field-control</code>, <code>field-affix</code>,{" "}
        <code>field-description</code>, <code>field-error</code>, <code>fieldset</code> and so on), and Base UI&apos;s
        state attributes on the field and its parts: <code>data-invalid</code>, <code>data-valid</code>,{" "}
        <code>data-dirty</code>, <code>data-touched</code>, <code>data-filled</code>, <code>data-focused</code> and{" "}
        <code>data-disabled</code>. The frame has <code>data-kl-layout</code>, a field with an <code>orientation</code>{" "}
        has <code>data-kl-orientation</code>, and the form has <code>data-kl-form-orientation</code>.
      </p>
    </>
  ),
};

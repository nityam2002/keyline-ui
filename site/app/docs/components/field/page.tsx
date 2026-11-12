import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { FieldOrder, FieldTracking, FieldCarton } from "@site/components/input-previews";

const ITEM = "field";

export const metadata = componentMetadata(
  "Field and form",
  "React form fields: label, frame, description and error for any input, and a form that lines them up and validates. A failed check says what to do.",
  "field",
);

const IMPORT = `import { Form, FormActions, Field, FieldLabel, FieldFrame, FieldInput, FieldError } from "@/components/keyline/ui/field"`;

const USAGE = `<Form onFormSubmit={placeOrder}>
  <Field name="client">
    <FieldLabel>Client</FieldLabel>
    <FieldFrame>
      <FieldInput required />
    </FieldFrame>
    <FieldError match="valueMissing">Who is the order for?</FieldError>
  </Field>
  <FormActions>
    <Button type="submit" variant="primary">Place order</Button>
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
      { id: "parts", label: "Several parts" },
    ],
  },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function FieldPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Field and form" toc={TOC}>
      <h1>Field and form</h1>
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

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

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

      <h3 id="parts">Several parts</h3>
      <p>
        <code>FieldGroup</code> puts several labelled inputs in one frame. A rule across them goes in{" "}
        <code>FieldGroupError</code>, and <code>invalid</code> marks the part that broke it.
      </p>
      <ComponentDemo
        label="Several parts example"
        preview={<FieldCarton />}
        code={code("field-carton.tsx", "parts example code")}
      />

      <h2 id="props">Props</h2>
      <PropsReference label="Field and form props" props={PROPS} />
      <p className="s-small">
        Also exported: <code>FieldTextarea</code>, <code>FieldAffix</code> for a unit or icon cell,{" "}
        <code>FieldBar</code> for a row across the frame, <code>FieldDescription</code>, and the <code>FieldGroup</code>{" "}
        parts. Built on <a href="https://base-ui.com/react/components/field">Base UI Field</a> and{" "}
        <a href="https://base-ui.com/react/components/form">Form</a>.
      </p>
    </DocPage>
  );
}

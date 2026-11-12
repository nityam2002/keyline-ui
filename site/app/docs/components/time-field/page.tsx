import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { TimeFieldDelivery } from "@site/components/input-previews";

const ITEM = "time-field";

export const metadata = componentMetadata(
  "Time field",
  "A React time input typed in parts on a 12- or 24-hour clock, with bounds and a time zone. Arrow keys step each part within the hours you allow. On Base UI.",
  "time-field",
);

const IMPORT = `import { TimeField } from "@/components/keyline/ui/time-field"`;

const USAGE = `<TimeField label="Truck arrives at" hourCycle={12} min="07:00" max="16:00" value={time} onValueChange={setTime} />`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the field; each part is named too. Required." },
  {
    name: "value",
    type: "string | null",
    default: "—",
    description: (
      <>
        Always 24-hour <code>&quot;HH:MM&quot;</code>, whichever clock is shown. <code>onValueChange</code> gets null
        while a part is missing.
      </>
    ),
  },
  { name: "hourCycle", type: "12 | 24", default: "24", description: "12 adds an AM/PM part, named by the locale." },
  {
    name: "min / max",
    type: '"HH:MM"',
    default: "—",
    description: (
      <>
        Arrow keys stay inside; a typed time outside is invalid with <code>rangeMessage</code>.
      </>
    ),
  },
  { name: "minuteStep", type: "number", default: "1", description: "Arrow keys move the minutes by this much." },
  {
    name: "zone",
    type: "ReactNode",
    default: "—",
    description: (
      <>
        A cell after the time, such as <code>EST</code>.
      </>
    ),
  },
  {
    name: "name",
    type: "string",
    default: "—",
    description: (
      <>
        Submits <code>&quot;HH:MM&quot;</code> with a form. <code>required</code> asks for a time.
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
  {
    label: "Reference",
    items: [
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

export default function TimeFieldPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Time field" toc={TOC}>
      <h1>Time field</h1>
      <p className="s-doc-lede">
        A time of day typed in parts: hours, minutes and, on a 12-hour clock, AM or PM. Type digits and it moves on by
        itself; arrow keys step each part and stay inside the hours you allow.
      </p>

      <ComponentDemo
        label="Time field example"
        preview={<TimeFieldDelivery />}
        code={code("time-field-delivery.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Time field props" props={PROPS} />
      <p className="s-small">
        Backspace in an empty part goes back to the one before; leaving a part pads it (&ldquo;7&rdquo; becomes
        &ldquo;07&rdquo;). In a right-to-left page the time keeps clock order.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        Base UI has no time field, so <code>TimeField</code> has no parts to compose: it is one component, built on Base
        UI&apos;s Field. Style it with <code>className</code> on the field, and reach inside by <code>data-slot</code>:{" "}
        <code>time-field</code>, <code>time-field-frame</code>, <code>time-field-value</code>,{" "}
        <code>time-field-join</code>, <code>time-field-period</code> (with <code>time-field-period-input</code>), and{" "}
        <code>time-field-zone</code>. Each part of the time is a <code>spinbutton</code>. The field has Base UI&apos;s{" "}
        <code>data-disabled</code> and <code>data-invalid</code>, and <code>data-kl-layout</code>.
      </p>
    </DocPage>
  );
}

import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { OtpSignIn } from "@site/components/input-previews";

const IMPORT = `import { OtpField } from "@/components/keyline/ui/otp-field"`;

const USAGE = `<OtpField
  label="Code from your phone"
  length={6}
  groups={[3, 3]}
  signal={signal}
  error="That code doesn't match."
  onValueComplete={verify}
/>`;

const PARTS = `<OtpFieldFrame units={6.5}>
  <OtpFieldRoot length={6} aria-label="Sign-in code" onValueChange={(code, eventDetails) => setCode(code)}>
    <OtpFieldInput />
    <OtpFieldInput />
    <OtpFieldInput />
    <OtpFieldSeparator />
    <OtpFieldInput />
    <OtpFieldInput />
    <OtpFieldInput />
  </OtpFieldRoot>
</OtpFieldFrame>`;

const PROPS: Prop[] = [
  {
    name: "label",
    type: "ReactNode",
    default: "—",
    description: <>Names the first cell; the rest are &ldquo;Character n of N&rdquo;. Required.</>,
  },
  { name: "length", type: "number", default: "—", description: "How many characters. Required." },
  {
    name: "groups",
    type: "number[]",
    default: "—",
    description: (
      <>
        Splits the cells, such as <code>[3, 3]</code>. Must add up to <code>length</code>.
      </>
    ),
  },
  {
    name: "onValueComplete",
    type: "(code: string) => void",
    default: "—",
    description: "Runs once every cell is filled, typed or pasted. Check the code here.",
  },
  {
    name: "signal",
    type: '"idle" | "pending" | "done" | "failed"',
    default: '"idle"',
    description: (
      <>
        <code>pending</code> makes the cells read-only while you check. <code>failed</code> turns the frame red and
        returns the caret to the first cell; pair it with <code>error</code>.
      </>
    ),
  },
  {
    name: "validationType",
    type: '"numeric" | "alpha" | "alphanumeric" | "none"',
    default: '"numeric"',
    description: "Which characters a cell takes.",
  },
  { name: "mask", type: "boolean", default: "false", description: "Hides the characters, for a PIN." },
  { name: "autoSubmit", type: "boolean", default: "false", description: "Submits the form once the code is complete." },
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

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React one-time code (OTP) input on Base UI: one frame with a cell per character, plus checking, verified and failed states. A wrong code resets the caret.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A one-time code in one frame, a cell per character. While you check it, a segment runs along the bottom edge; a
        wrong code turns the frame red and puts the caret back at the start.
      </p>

      <ComponentDemo label="OTP field example" preview={<OtpSignIn />} code={code("otp-sign-in.tsx", "example code")} />
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
        Pasting a whole code fills every cell; Backspace in an empty cell goes back one. Built on{" "}
        <a href="https://base-ui.com/react/components/otp-field">Base UI OTP Field</a>.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>OtpFieldRoot</code>, <code>OtpFieldInput</code> (one cell) and{" "}
        <code>OtpFieldSeparator</code> (the join between groups, drawn as a dash). <code>OtpFieldFrame</code> is
        Keyline&apos;s: the control frame, with the ! cell at its start; its <code>units</code> is the code&apos;s width
        in cells, a join counting half. <code>OtpField</code> is built from them, and its <code>onValueChange</code>{" "}
        also gets Base UI&apos;s event details. Every part takes <code>render</code>, and a <code>className</code> or{" "}
        <code>style</code> that may be a function of its state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> (<code>otp-field-frame</code>, <code>otp-field-root</code>,{" "}
        <code>otp-field-input</code>, <code>otp-field-separator</code>; <code>OtpField</code>&apos;s outer field is{" "}
        <code>otp-field</code>, and its ✓ cell <code>otp-field-done</code>), and Base UI&apos;s state attributes:{" "}
        <code>data-filled</code>, <code>data-disabled</code>, <code>data-readonly</code> and <code>data-invalid</code>.
        The outer field has <code>data-signal</code> while a signal shows; the frame has <code>data-kl-layout</code>.
      </p>
    </>
  ),
};

import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { OtpSignIn } from "@site/components/input-previews"

const ITEM = "otp-field"

export const metadata = componentMetadata("OTP field", "A React one-time code (OTP) input on Base UI: one frame with a cell per character, plus checking, verified and failed states. A wrong code resets the caret.", "otp-field")

const IMPORT = `import { OtpField } from "@/components/keyline/ui/otp-field"`

const USAGE = `<OtpField
  label="Code from your phone"
  length={6}
  groups={[3, 3]}
  signal={signal}
  error="That code doesn't match."
  onValueComplete={verify}
/>`

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: <>Names the first cell; the rest are &ldquo;Character n of N&rdquo;. Required.</> },
  { name: "length", type: "number", default: "—", description: "How many characters. Required." },
  { name: "groups", type: "number[]", default: "—", description: <>Splits the cells, such as <code>[3, 3]</code>. Must add up to <code>length</code>.</> },
  { name: "onValueComplete", type: "(code: string) => void", default: "—", description: "Runs once every cell is filled, typed or pasted. Check the code here." },
  { name: "signal", type: '"idle" | "pending" | "done" | "failed"', default: '"idle"', description: <><code>pending</code> makes the cells read-only while you check. <code>failed</code> turns the frame red and returns the caret to the first cell; pair it with <code>error</code>.</> },
  { name: "validationType", type: '"numeric" | "alpha" | "alphanumeric" | "none"', default: '"numeric"', description: "Which characters a cell takes." },
  { name: "mask", type: "boolean", default: "false", description: "Hides the characters, for a PIN." },
  { name: "autoSubmit", type: "boolean", default: "false", description: "Submits the form once the code is complete." },
  { name: "error", type: "ReactNode", default: "—", description: <>The message when a check fails. With <code>invalid</code> it always shows.</> },
  { name: "description", type: "ReactNode", default: "—", description: "A line under the field, read out with it." },
  { name: "layout", type: '"control" | "cell"', default: '"control"', description: <><code>cell</code> drops the frame and hides the label, to sit inside another frame.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function OtpFieldPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="OTP field" toc={TOC}>
      <h1>OTP field</h1>
      <p className="s-doc-lede">
        A one-time code in one frame, a cell per character. While you check it, a segment runs along the bottom edge; a wrong code turns the frame red and puts the caret back at the start.
      </p>

      <ComponentDemo label="OTP field example" preview={<OtpSignIn />} code={code("otp-sign-in.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="OTP field props" props={PROPS} />
      <p className="s-small">
        Pasting a whole code fills every cell; Backspace in an empty cell goes back one. Built on <a href="https://base-ui.com/react/components/otp-field">Base UI OTP Field</a>.
      </p>
    </DocPage>
  )
}

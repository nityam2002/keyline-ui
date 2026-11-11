import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { StatusDeliveries, StatusBadges } from "@site/components/data-previews"

const ITEM = "status"

export const metadata = componentMetadata("Status and badge", "React status and badge components: a state as a glyph and words that reads in grayscale and forced colours, and a square code badge. Only attention is red.", "status")

const IMPORT = `import { Badge, Status } from "@/components/keyline/ui/status"`

const USAGE = `<Status kind="attention">Held: no one to sign</Status>
<Badge>DM-4111</Badge>
<Badge tone="signal">RUSH</Badge>`

const PROPS: Prop[] = [
  { name: "kind", type: "\"normal\" | \"waiting\" | \"attention\" | \"done\" | \"none\"", default: "\u2014", description: <>On <code>Status</code>: the glyph. Each kind has its own shape; the words say the rest.</> },
  { name: "children", type: "ReactNode", default: "\u2014", description: <>The state in words. Say what to do when it is <code>attention</code>.</> },
  { name: "tone", type: "\"plain\" | \"signal\" | \"attention\"", default: "\"plain\"", description: <>On <code>Badge</code>. <code>signal</code> is the only filled badge.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "badge-tones", label: "Badge tones" }, { id: "props", label: "Props" }] },
]

export default function StatusPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Status and badge" toc={TOC}>
      <h1>Status and badge</h1>
      <p className="s-doc-lede">
        A state in words with a glyph whose shape carries the meaning, so it reads in grayscale and in forced colours. Only attention is red. Badge is a square code label in a 1px frame, never a pill.
      </p>

      <ComponentDemo label="Status and badge example" preview={<StatusDeliveries />} code={code("status-deliveries.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="badge-tones">Badge tones</h3>
      <p>
        <code>plain</code> labels a code, <code>signal</code> is the one filled form for what is new or urgent, and <code>attention</code> marks what needs someone. Keep to one signal badge in view.
      </p>
      <ComponentDemo label="Badge tones example" preview={<StatusBadges />} code={code("status-badges.tsx", "badge tones example code")} />


      <h2 id="props">Props</h2>
      <PropsReference label="Status and badge props" props={PROPS} />
      <p className="s-small">
        Both render a <code>span</code> and pass other props through. A badge holds a code or a short word in capitals, not a sentence.
      </p>
    </DocPage>
  )
}

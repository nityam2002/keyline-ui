import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { EmptySearch, EmptyCalls } from "@site/components/data-previews"

const ITEM = "empty"

export const metadata = componentMetadata("Empty", "A React empty state for no results, first use and load errors: the count, what happened and the way out, without an illustration.", "empty")

const IMPORT = `import { Empty } from "@/components/keyline/ui/empty"`

const USAGE = `<Empty
  live
  title="No clients match “Stamford”"
  description="Try the company, not the branch."
  actions={<Button onClick={clear}>Clear search</Button>}
/>`

const PROPS: Prop[] = [
  { name: "kind", type: "\"empty\" | \"error\" | \"start\"", default: "\"empty\"", description: "Nothing matched, it could not load, or nothing has been made yet." },
  { name: "title", type: "ReactNode", default: "\u2014", description: "What is empty, in words." },
  { name: "description", type: "ReactNode", default: "\u2014", description: "Why, and what to try." },
  { name: "actions", type: "ReactNode", default: "\u2014", description: "Buttons. The first is the way out: clear, retry or create." },
  { name: "count", type: "ReactNode", default: "0, ! or +", description: "The figure in the count cell." },
  { name: "code", type: "ReactNode", default: "by kind", description: "The word under the figure: RESULTS, ERROR or NEW." },
  { name: "live", type: "boolean", default: "false", description: <>Announce it when it appears. Use when it replaces what someone was looking at.</> },
  { name: "layout", type: "\"control\" | \"cell\"", default: "\"control\"", description: <><code>cell</code> sits inside another frame, such as a panel or table.</> },
  { name: "headingLevel", type: "2 \u2013 6", default: "3", description: "The title's heading level." },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "first-use-and-errors", label: "First use and errors" }, { id: "props", label: "Props" }] },
]

export default function EmptyPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Empty" toc={TOC}>
      <h1>Empty</h1>
      <p className="s-doc-lede">
        A place with nothing in it, said plainly: the count, what happened and the way out. No illustration; the number is the picture. Below 520px of its own width the actions move under the message.
      </p>

      <ComponentDemo label="Empty example" preview={<EmptySearch />} code={code("empty-search.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="first-use-and-errors">First use and errors</h3>
      <p>
        <code>kind=&quot;error&quot;</code> turns the count cell red and announces itself with <code>live</code>; Retry fails once here, then works. <code>kind=&quot;start&quot;</code> is for a place that has nothing yet, with the action that makes the first thing.
      </p>
      <ComponentDemo label="First use and errors example" preview={<EmptyCalls />} code={code("empty-calls.tsx", "first use and errors example code")} />


      <h2 id="props">Props</h2>
      <PropsReference label="Empty props" props={PROPS} />
      <p className="s-small">
        The title is a heading, so place it where the outline expects one.
      </p>
    </DocPage>
  )
}

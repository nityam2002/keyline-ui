import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { ToastUndo, ToastPromise } from "@site/components/overlay-previews"

const ITEM = "toast"

export const metadata = componentMetadata("Toast", "React toast notifications on Base UI: a short record of what just happened, with at most one action such as Undo. Hover or focus fans the stack and pauses it.", "toast")

const IMPORT = `import { ToastFloating, ToastProvider, useToaster } from "@/components/keyline/ui/toast"`

const USAGE = `<ToastProvider>
  <App />
  <ToastFloating />
</ToastProvider>

const toast = useToaster()
toast.notify({ title: "DM-4103 archived", action: { label: "Undo", onClick: restore } })`

const PROPS: Prop[] = [
  { name: "notify", type: "({ title, description?, type?, action?, timeout? }) => id", default: "\u2014", description: <>From <code>useToaster()</code>. <code>type</code> is done, failed, info, warning or loading.</> },
  { name: "promise", type: "(p, { loading, done, failed }) => p", default: "\u2014", description: "One toast that follows a promise. Each state takes a title, a full toast, or a function of the result." },
  { name: "update \u00b7 dismiss", type: "(id, \u2026) \u00b7 (id?)", default: "\u2014", description: "Change a toast in place, or close one or all." },
  { name: "timeout \u00b7 limit", type: "number", default: "6000 \u00b7 3", description: <>On <code>ToastProvider</code>: how long a toast stays, and how many show at once.</> },
  { name: "ToastDock", type: "Viewport", default: "\u2014", description: "Shows toasts inside a cell of your layout, such as a table&apos;s footer, so they never cover data." },
  { name: "createToaster", type: "() => manager", default: "\u2014", description: "A toaster to call from outside React, such as a data layer." },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "track-a-promise", label: "Track a promise" }, { id: "props", label: "Props" }] },
]

export default function ToastPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Toast" toc={TOC}>
      <h1>Toast</h1>
      <p className="s-doc-lede">
        A short record of something that just happened, with at most one action. The newest sits in front and counts the ones waiting behind; hover or focus fans them out and pauses every timer. The bottom keyline drains as the time runs out. Swipe it away, or press its close cell.
      </p>

      <ComponentDemo label="Toast example" preview={<ToastUndo />} code={code("toast-undo.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="track-a-promise">Track a promise</h3>
      <p>
        <code>promise</code> shows one toast while the work runs and turns it into done or failed in place. The first send here fails so you can see the retry.
      </p>
      <ComponentDemo label="Track a promise example" preview={<ToastPromise />} code={code("toast-promise.tsx", "track a promise example code")} />


      <h2 id="props">Props</h2>
      <PropsReference label="Toast props" props={PROPS} />
      <p className="s-small">
        For a condition that is still true, such as low stock, use Notice. Built on <a href="https://base-ui.com/react/components/toast">Base UI Toast</a>.
      </p>
    </DocPage>
  )
}

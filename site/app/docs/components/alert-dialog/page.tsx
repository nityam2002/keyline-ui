import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { AlertDialogRemove } from "@site/components/overlay-previews"

const ITEM = "alert-dialog"

export const metadata = componentMetadata("Alert dialog", "A React alert dialog for actions that can't be undone. The safe choice takes focus, the destructive one says what it does, and a click outside never closes it.", "alert-dialog")

const IMPORT = `import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "@/components/keyline/ui/dialog"`

const USAGE = `<AlertDialog>
  <AlertDialogTrigger render={<Button />}>Remove</AlertDialogTrigger>
  <AlertDialogContent
    title="Remove Vance Refrigeration?"
    description="Their 6 open orders are cancelled. This can't be undone."
    cancelLabel="Keep the client"
    confirmLabel="Remove client"
    onConfirm={remove}
  />
</AlertDialog>`

const PROPS: Prop[] = [
  { name: "title", type: "ReactNode", default: "\u2014", description: "A question that names what is at stake." },
  { name: "description", type: "ReactNode", default: "\u2014", description: "What happens, and that it can&apos;t be undone." },
  { name: "cancelLabel \u00b7 confirmLabel", type: "string", default: "\u2014", description: "Verbs for both cells. &ldquo;Keep the client&rdquo; reads better than &ldquo;Cancel&rdquo;." },
  { name: "onConfirm", type: "() => void", default: "\u2014", description: "Runs on the confirm cell. The dialog closes after." },
  { name: "tone", type: "\"destructive\" | \"primary\"", default: "\"destructive\"", description: <><code>primary</code> is for a weighty choice that destroys nothing, such as sending.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function AlertDialogPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Alert dialog" toc={TOC}>
      <h1>Alert dialog</h1>
      <p className="s-doc-lede">
        Asks before something that can&apos;t be undone. It has a title that names the thing, a sentence on what happens to it, and two cells. The safe choice takes focus, so a stray Enter keeps the client; the destructive one is red and says what it does. A click on the dimmed page doesn&apos;t close it.
      </p>

      <ComponentDemo label="Alert dialog example" preview={<AlertDialogRemove />} code={code("alert-dialog-remove.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Alert dialog props" props={PROPS} />
      <p className="s-small">
        Alert dialog ships inside the dialog item; installing <code>@keyline-ui/alert-dialog</code> installs <code>@keyline-ui/dialog</code>. Built on <a href="https://base-ui.com/react/components/alert-dialog">Base UI Alert Dialog</a>.
      </p>
    </DocPage>
  )
}

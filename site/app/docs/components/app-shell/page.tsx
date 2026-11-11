import Link from "next/link"
import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { AppShellOffice } from "@site/components/layout-previews"

const ITEM = "app-shell"

export const metadata = componentMetadata("App shell", "A React app shell: header, sidebar, page and aside laid out by the shell's own width, so it works in a pane too. When narrow, aside and sidebar become sheets.", "app-shell")

const IMPORT = `import { AppShell } from "@/components/keyline/ui/app-shell"`

const USAGE = `<AppShell
  navLabel="Scranton branch"
  nav={<Nav layout="cell" label="Scranton branch" items={…} />}
  header={<Breadcrumb layout="cell" items={…} />}
  actions={<Button layout="cell" variant="primary">New order</Button>}
  aside={<Inspector>…</Inspector>}
  asideOpen={!!order}
  onAsideOpenChange={…}
>
  …the page
</AppShell>`

const PROPS: Prop[] = [
  { name: "nav", type: "ReactNode", default: "\u2014", description: <>The sidebar, usually <code>Nav layout=&quot;cell&quot;</code>.</> },
  { name: "navLabel", type: "string", default: "\u2014", description: "Names the sidebar: the toggle says &ldquo;Show&rdquo; it, and its narrow sheet takes the name." },
  { name: "navOpen \u00b7 defaultNavOpen \u00b7 onNavOpenChange", type: "boolean", default: "true", description: "Whether the sidebar column shows on a wide layout." },
  { name: "collapse", type: "\"hide\" | \"rail\"", default: "\"hide\"", description: <>What closing the sidebar does. <code>rail</code> keeps a column of icons. See Sidebar.</> },
  { name: "header \u00b7 actions", type: "ReactNode", default: "\u2014", description: <>The header after the toggle (usually a Breadcrumb) and the cells at its end (a Button, or a Toolbar with <code>overflow=&quot;menu&quot;</code>).</> },
  { name: "aside \u00b7 asideOpen \u00b7 onAsideOpenChange", type: "ReactNode \u00b7 boolean", default: "\u2014", description: "A panel at the end, such as an Inspector, shown while open." },
  { name: "asideFinalFocus", type: "ref", default: "\u2014", description: "Where focus goes when the aside&apos;s sheet closes. Pass the control that opened it." },
  { name: "narrowAt \u00b7 asideInlineAt", type: "number", default: "960 \u00b7 narrowAt + 440", description: "Shell widths where the sidebar and the aside turn into sheets." },
  { name: "navSize \u00b7 asideSize", type: "number | string", default: "15rem \u00b7 22rem", description: "Column widths on a wide layout." },
  { name: "stickyHeader", type: "boolean", default: "false", description: "Keeps the header in view; the columns stay put while the page scrolls past." },
  { name: "mainProps", type: "props of <main>", default: "\u2014", description: "For the page&apos;s main element." },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function AppShellPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="App shell" toc={TOC}>
      <h1>App shell</h1>
      <p className="s-doc-lede">
        The page around an app&apos;s screens: a header frame, the <Link href="/docs/components/sidebar">sidebar</Link>, the page and an optional aside, one gutter apart. It lays itself out by its own width, not the window&apos;s, so it works in a pane too. Wide, everything sits side by side. Narrower, the aside opens as a sheet. Narrowest, the sidebar does too.
      </p>

      <ComponentDemo label="App shell example" preview={<AppShellOffice />} code={code("app-shell-office.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="App shell props" props={PROPS} />
      <p className="s-small">
        The example sets <code>narrowAt</code> low so the sidebar stays in a preview this size. Choose an order to open the aside: on this page&apos;s width it opens as a sheet. This site&apos;s docs pages are a Keyline AppShell.
      </p>
    </DocPage>
  )
}

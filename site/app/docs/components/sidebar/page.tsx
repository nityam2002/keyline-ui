import Link from "next/link"
import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { SidebarRail } from "@site/components/layout-previews"

const ITEM = "sidebar"

export const metadata = componentMetadata("Sidebar", "A React sidebar built from AppShell and Nav: it folds to a rail of icons with labels on hover and focus, and opens as a sheet in a narrow shell.", "sidebar")

const IMPORT = `import { AppShell } from "@/components/keyline/ui/app-shell"
import { Nav } from "@/components/keyline/ui/nav"`

const USAGE = `<AppShell
  collapse="rail"
  navLabel="Scranton branch"
  nav={<Nav layout="cell" label="Scranton branch" value={view} onValueChange={setView} items={items} />}
>
  …
</AppShell>`

const PROPS: Prop[] = [
  { name: "collapse", type: "\"hide\" | \"rail\"", default: "\"hide\"", description: <>On <code>AppShell</code>: <code>rail</code> folds to icons; every item needs an <code>icon</code>.</> },
  { name: "navOpen \u00b7 onNavOpenChange", type: "boolean", default: "true", description: <>On <code>AppShell</code>: whether the sidebar is open, to remember it between visits.</> },
  { name: "layout", type: "\"cell\"", default: "\u2014", description: <>On <code>Nav</code>: always <code>cell</code> inside the shell, which draws the frame.</> },
  { name: "icon", type: "ReactNode", default: "\u2014", description: <>On each Nav item: a 16px glyph. In the rail it is all that shows.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function SidebarPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Sidebar" toc={TOC}>
      <h1>Sidebar</h1>
      <p className="s-doc-lede">
        A sidebar is <Link href="/docs/components/app-shell">AppShell</Link>&apos;s <code>nav</code> holding a Keyline <Link href="/docs/components/nav">Nav</Link>; there&apos;s no separate component. With <code>collapse=&quot;rail&quot;</code>, the toggle in the header folds it to a column of icons, and each label shows beside its icon on hover and focus. On a narrow shell it opens as a sheet.
      </p>

      <ComponentDemo label="Sidebar example" preview={<SidebarRail />} code={code("sidebar-rail.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Sidebar props" props={PROPS} />
      <p className="s-small">
        <code>@keyline-ui/sidebar</code> installs AppShell and Nav together. Nav&apos;s own page covers groups, nested items and counts.
      </p>
    </DocPage>
  )
}

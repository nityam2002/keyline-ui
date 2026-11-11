import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { MenubarReport } from "@site/components/action-previews"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"

const ITEM = "menubar"

export const metadata = componentMetadata("Menubar", "A React menubar: a row of menus in one frame. Each menu docks under its title, and with one open, Left and Right move to the next. On Base UI.", "menubar")

const IMPORT = `import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/keyline/ui/menubar"`

const USAGE = `<Menubar aria-label="Sales report">
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem onClick={print}>Print</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`

const PROPS: Prop[] = [
  { name: "layout", type: '"control" | "cell"', default: '"control"', description: <><code>cell</code> drops the frame, for a menubar that is the top row of a Panel or an app shell header.</> },
  { name: "aria-label", type: "string", default: "—", description: "Name the bar for what its menus act on." },
  { name: "loopFocus", type: "boolean", default: "true", description: "Left and Right wrap from the last title to the first." },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function MenubarPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Menubar" toc={TOC}>
      <h1>Menubar</h1>
      <p className="s-doc-lede">
        A row of menus in one frame. Each title is a cell; its menu docks to the frame&rsquo;s bottom edge under it. With one menu open, Left and Right move to the next.
      </p>

      <ComponentDemo widths label="Menubar example" preview={<MenubarReport />} code={code("menubar-report.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <p>
        The rows are Menu&rsquo;s, re-exported under Menubar names: <code>MenubarItem</code>, <code>MenubarCheckboxItem</code>, <code>MenubarRadioGroup</code>, <code>MenubarRadioItem</code>,{" "}
        <code>MenubarSeparator</code> and the submenu parts.
      </p>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Menubar props" props={PROPS} />
      <p className="s-small">
        At narrow widths the titles scroll inside the frame and the hidden edge is shaded. Built on{" "}
        <a href="https://base-ui.com/react/components/menubar">Base UI Menubar</a>.
      </p>
    </DocPage>
  )
}

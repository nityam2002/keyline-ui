import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { PaginationInvoices } from "@site/components/nav-previews"

const ITEM = "pagination"

export const metadata = componentMetadata("Pagination", "A React pagination control whose frame never changes width while you page, so Previous and Next stay under the pointer. Folds to “5 / 19” when narrow.", "pagination")

const IMPORT = `import { Pagination } from "@/components/keyline/ui/pagination"`

const USAGE = `<Pagination page={page} pageCount={19} onPageChange={setPage} label="Invoice pages" />`

const PROPS: Prop[] = [
  { name: "page", type: "number", default: "\u2014", description: "The current page, starting at 1." },
  { name: "pageCount", type: "number | null", default: "\u2014", description: <>How many pages. <code>null</code> while unknown: every cell is out of service.</> },
  { name: "onPageChange", type: "(page: number) => void", default: "\u2014", description: "Called with the page to show." },
  { name: "getHref", type: "(page: number) => string", default: "\u2014", description: "Makes each page a link, so pages can open in a new tab." },
  { name: "siblings", type: "number", default: "1", description: "Pages shown on each side of the current one." },
  { name: "label", type: "string", default: "\"Pagination\"", description: "Names the navigation landmark. Name what is paged." },
  { name: "pageLabel", type: "(page: number) => string", default: "Page n", description: "What a screen reader hears for each number." },
  { name: "layout", type: "\"control\" | \"cell\"", default: "\"control\"", description: <><code>cell</code> sits in a panel&apos;s or table&apos;s footer.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function PaginationPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Pagination" toc={TOC}>
      <h1>Pagination</h1>
      <p className="s-doc-lede">
        Page numbers as cells in one frame. The window always holds the same number of cells, each as wide as the largest page number, so the frame keeps its width and Previous and Next stay under your pointer. Under 360px of its own width the numbers fold into one &ldquo;5 / 19&rdquo; cell.
      </p>

      <ComponentDemo label="Pagination example" preview={<PaginationInvoices />} code={code("pagination-invoices.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Pagination props" props={PROPS} />
      <p className="s-small">
        Inside a Table, use <code>TablePagination</code>, which also shows the range of rows.
      </p>
    </DocPage>
  )
}

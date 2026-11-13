import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { PaginationInvoices } from "@site/components/nav-previews";

const IMPORT = `import { Pagination } from "@/components/keyline/ui/pagination"`;

const USAGE = `<Pagination page={page} pageCount={19} onPageChange={setPage} label="Invoice pages" />`;

const PROPS: Prop[] = [
  { name: "page", type: "number", default: "\u2014", description: "The current page, starting at 1." },
  {
    name: "pageCount",
    type: "number | null",
    default: "\u2014",
    description: (
      <>
        How many pages. <code>null</code> while unknown: every cell is out of service.
      </>
    ),
  },
  {
    name: "onPageChange",
    type: "(page: number) => void",
    default: "\u2014",
    description: "Called with the page to show.",
  },
  {
    name: "getHref",
    type: "(page: number) => string",
    default: "\u2014",
    description: "Makes each page a link, so pages can open in a new tab.",
  },
  { name: "siblings", type: "number", default: "1", description: "Pages shown on each side of the current one." },
  {
    name: "label",
    type: "string",
    default: '"Pagination"',
    description: "Names the navigation landmark. Name what is paged.",
  },
  {
    name: "pageLabel",
    type: "(page: number) => string",
    default: "Page n",
    description: "What a screen reader hears for each number.",
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> sits in a panel&apos;s or table&apos;s footer.
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
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React pagination control whose frame never changes width while you page, so Previous and Next stay under the pointer. Folds to “5 / 19” when narrow.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        Page numbers as cells in one frame. The window always holds the same number of cells, each as wide as the
        largest page number, so the frame keeps its width and Previous and Next stay under your pointer. Under 360px of
        its own width the numbers fold into one &ldquo;5 / 19&rdquo; cell.
      </p>

      <ComponentDemo
        label="Pagination example"
        preview={<PaginationInvoices />}
        code={code("pagination-invoices.tsx", "example code")}
      />
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
        Inside a Table, use <code>TablePagination</code>, which also shows the range of rows.
      </p>
      <p className="s-small">
        Each element carries a <code>data-slot</code> to select it by: <code>pagination</code> (the nav, which takes{" "}
        <code>className</code> and the nav&apos;s props), <code>pagination-frame</code>,{" "}
        <code>pagination-previous</code>, <code>pagination-next</code>, <code>pagination-page</code> (the current one
        with <code>aria-current=&quot;page&quot;</code>), <code>pagination-ellipsis</code> and{" "}
        <code>pagination-status</code> (the &quot;5 / 20&quot; cell). A step out of service is <code>disabled</code>,
        or, as a link, <code>data-disabled</code>.
      </p>
    </>
  ),
};

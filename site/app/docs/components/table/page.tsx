import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { TableOrders, TableLines, TableLoading } from "@site/components/data-previews";

const ITEM = "table";

export const metadata = componentMetadata(
  "Table",
  "A React data table in one frame: view tabs, search, sortable columns, selection with a bulk bar, expandable rows, loading, empty and error rows, and a pager.",
  "table",
);

const IMPORT = `import {
  Table, TableBody, TableCell, TableFrame, TableHead, TableHeaderCell,
  TablePagination, TableRow, TableScroll, TableSortHeader, nextSort, sortOf,
} from "@/components/keyline/ui/table"`;

const USAGE = `<TableFrame>
  <TableScroll>
    <Table aria-label="Orders">
      <TableHead>
        <tr>
          <TableSortHeader sort={sortOf(sort, "client")} onSort={() => setSort((s) => nextSort(s, "client"))}>
            Client
          </TableSortHeader>
          <TableHeaderCell align="end">Cases</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {rows.map((o) => (
          <TableRow key={o.id}>
            <TableCell>{o.client}</TableCell>
            <TableCell align="end">{o.cases}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableScroll>
  <TablePagination page={page} pageSize={5} total={rows.length} onPageChange={setPage} noun="orders" />
</TableFrame>`;

const PROPS: Prop[] = [
  {
    name: "TableFrame",
    type: "section",
    default: "\u2014",
    description: "The one frame. Put the other parts inside, in order.",
  },
  {
    name: "TableViews",
    type: "{ views, value, onValueChange, label? }",
    default: "\u2014",
    description: "View tabs with counts, built on Tabs.",
  },
  {
    name: "TableToolbar \u00b7 TableSearch",
    type: "group \u00b7 search input",
    default: "\u2014",
    description: (
      <>
        The filter row. <code>TableSearch</code> takes a <code>label</code> for screen readers.
      </>
    ),
  },
  {
    name: "TableBulkBar",
    type: "{ count, scope?, children? }",
    default: "\u2014",
    description: "How many are selected, what that covers, and the actions as cell buttons.",
  },
  {
    name: "TableIndexCell",
    type: "{ checked, onCheckedChange, label, code?, header?, indeterminate? }",
    default: "\u2014",
    description: (
      <>
        The selection column. In the header, <code>indeterminate</code> for a partial page.
      </>
    ),
  },
  {
    name: "TableSortHeader",
    type: "{ sort, onSort, align?, priority?, levels? }",
    default: "\u2014",
    description: (
      <>
        The header cell is the button. <code>nextSort</code> and <code>sortOf</code> run the cycle: ascending,
        descending, none. For several columns, <code>nextSortList</code> with Shift.
      </>
    ),
  },
  { name: "TableRow", type: "{ selected?, expanded? }", default: "\u2014", description: "A row of the grid." },
  {
    name: "TableCell \u00b7 TableHeaderCell",
    type: '{ align?: "end" }',
    default: "\u2014",
    description: "Figures end-aligned.",
  },
  {
    name: "TableState",
    type: '{ kind: "empty" | "error", count, title, body?, action?, colSpan }',
    default: "\u2014",
    description: "An Empty spanning the grid. Errors are announced.",
  },
  {
    name: "TablePagination",
    type: "{ page, pageSize, total, onPageChange, noun? }",
    default: "\u2014",
    description: (
      <>
        The range and previous / next. <code>page</code> starts at 0; <code>total={null}</code> while loading.
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
  {
    label: "Reference",
    items: [
      { id: "expandable-rows", label: "Expandable rows" },
      { id: "loading-and-errors", label: "Loading and errors" },
      { id: "props", label: "Props" },
    ],
  },
];

export default function TablePage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Table" toc={TOC}>
      <h1>Table</h1>
      <p className="s-doc-lede">
        A table is one frame, and every part of it is a cell stacked inside: view tabs, the filter row, the bulk bar,
        the grid and the pager. You compose the parts you need and keep the data. Wide tables scroll sideways inside
        their frame, never the page.
      </p>

      <ComponentDemo label="Table example" preview={<TableOrders />} code={code("table-orders.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="expandable-rows">Expandable rows</h3>
      <p>
        <code>TableExpandCell</code> toggles a <code>TableDetail</code> that unfolds from the row&apos;s bottom keyline;
        the row itself never moves. With an index cell, give it <code>rowSpan={2}</code> while open, using{" "}
        <code>useDetailPresence</code> so it stays merged while the detail folds back.
      </p>
      <ComponentDemo
        label="Expandable rows example"
        preview={<TableLines />}
        code={code("table-lines.tsx", "expandable rows example code")}
      />

      <h3 id="loading-and-errors">Loading and errors</h3>
      <p>
        <code>TableLoadingRows</code> holds the grid&apos;s shape while it loads, and <code>total={null}</code> blanks
        the pager so it shows no stale numbers. <code>TableState kind=&quot;error&quot;</code> is announced and offers
        the way back; this one fails once, then Retry works.
      </p>
      <ComponentDemo
        label="Loading and errors example"
        preview={<TableLoading />}
        code={code("table-loading.tsx", "loading and errors example code")}
      />

      <h2 id="props">Props</h2>
      <PropsReference label="Table props" props={PROPS} />
      <p className="s-small">
        For rows that leave and come back (a cancel and its Undo), <code>useRowMotion</code> slides the rest into place.
        Sorting, filtering and paging are always instant. The parts render native table elements, so put your own{" "}
        <code>aria-label</code> on <code>Table</code>.
      </p>
    </DocPage>
  );
}

import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { TableOrders, TableLines, TableLoading } from "@site/components/data-previews";

const IMPORT = `import {
  Table, TableBody, TableCell, TableFrame, TableHeader, TableHead,
  TablePagination, TableRow, TableScroll, TableSortHeader, nextSort, sortOf,
} from "@/components/keyline/ui/table"`;

const USAGE = `<TableFrame>
  <TableScroll>
    <Table aria-label="Orders">
      <TableHeader>
        <tr>
          <TableSortHeader sort={sortOf(sort, "client")} onSort={() => setSort((s) => nextSort(s, "client"))}>
            Client
          </TableSortHeader>
          <TableHead align="end">Cases</TableHead>
        </tr>
      </TableHeader>
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
    name: "Table \u00b7 TableHeader \u00b7 TableBody \u00b7 TableCaption",
    type: "table \u00b7 thead \u00b7 tbody \u00b7 caption",
    default: "\u2014",
    description: (
      <>
        The grid&apos;s elements. <code>TableCaption</code> names the table, read before its rows.
      </>
    ),
  },
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
    description: (
      <>
        How many are selected, what that covers, and the actions as cell buttons. Announced politely;{" "}
        <code>data-empty</code> at 0.
      </>
    ),
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
  {
    name: "TableRow",
    type: "{ selected?, expanded? }",
    default: "\u2014",
    description: (
      <>
        A row of the grid. It carries <code>data-selected</code> and <code>data-expanded</code>; add{" "}
        <code>aria-selected</code> when rows are selectable.
      </>
    ),
  },
  {
    name: "TableCell \u00b7 TableHead",
    type: '{ align?: "end" }',
    default: "\u2014",
    description: (
      <>
        Figures end-aligned. To make a body cell its row&apos;s header: <code>{'render={<th scope="row" />}'}</code>.
      </>
    ),
  },
  {
    name: "TableDetail",
    type: "{ presence, colSpan, id? }",
    default: "\u2014",
    description: (
      <>
        The expanded row&apos;s detail. <code>presence</code> comes from <code>useDetailPresence(open)</code> in the row
        that owns it.
      </>
    ),
  },
  {
    name: "TableState",
    type: '{ kind: "empty" | "error", count, title, body?, action?, colSpan }',
    default: "\u2014",
    description: "An Empty spanning the grid. Errors are announced.",
  },
  {
    name: "TablePager",
    type: "div",
    default: "\u2014",
    description: (
      <>
        The pager&apos;s row of cells, for your own controls. <code>TablePagination</code> fills it.
      </>
    ),
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

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React data table in one frame: view tabs, search, sortable columns, selection with a bulk bar, expandable rows, loading, empty and error rows, and a pager.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A table is one frame, and every part of it is a cell stacked inside: view tabs, the filter row, the bulk bar,
        the grid and the pager. You compose the parts you need and keep the data and its state. Wide tables scroll
        sideways inside their frame, never the page. For sorting, filtering, paging and selection worked out for you,
        use the <a href="/docs/components/data-table">data table</a>.
      </p>

      <ComponentDemo label="Table example" preview={<TableOrders />} code={code("table-orders.tsx", "example code")} />
    </>
  ),
  usage: (
    <>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: (
    <>
      <h2 id="examples">Examples</h2>

      <h3 id="expandable-rows">Expandable rows</h3>
      <p>
        <code>TableExpandCell</code> toggles a <code>TableDetail</code> that unfolds from the row&apos;s bottom keyline;
        the row itself never moves. The row that owns the detail calls <code>useDetailPresence(open)</code> and passes
        it as the detail&apos;s <code>presence</code>; with an index cell, give that <code>rowSpan={2}</code> while the
        presence is mounted, so it stays merged while the detail folds back.
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
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        For rows that leave and come back (a cancel and its Undo), <code>useRowMotion</code> slides the rest into place.
        Sorting, filtering and paging are always instant. The parts render native table elements, so name the table with{" "}
        <code>aria-label</code> or a <code>TableCaption</code>. Every grid part takes <code>render</code> to swap its
        element, and a <code>className</code> or <code>style</code> that may be a function of its state (a sort
        header&apos;s <code>sort</code> and <code>priority</code>, a row&apos;s <code>selected</code> and{" "}
        <code>expanded</code>).
      </p>
    </>
  ),
};

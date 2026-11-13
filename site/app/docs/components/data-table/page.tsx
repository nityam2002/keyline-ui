import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { DataTableOrders } from "@site/components/data-previews";

const ITEM = "data-table";

export const metadata = componentMetadata(
  "Data table",
  "A React data table on TanStack Table: sorting, multi-sort, search, filters, paging and row selection, drawn with Keyline's table parts.",
  "data-table",
);

const IMPORT = `import {
  DataTable, DataTableBulkBar, DataTablePagination, DataTableSearch, useDataTable,
  type DataTableColumnDef,
} from "@/components/keyline/ui/data-table"
import { TableFrame, TableScroll, TableToolbar } from "@/components/keyline/ui/table"`;

const USAGE = `const columns: DataTableColumnDef<Order>[] = [
  { accessorKey: "id", header: "Order" },
  { accessorKey: "client", header: "Client" },
  { accessorKey: "cases", header: "Cases", sortDescFirst: true, meta: { align: "end" } },
]

function Orders({ orders }: { orders: Order[] }) {
  const table = useDataTable({ data: orders, columns })
  return (
    <TableFrame>
      <TableToolbar>
        <DataTableSearch table={table} label="Search orders" />
      </TableToolbar>
      <DataTableBulkBar table={table} scope={(n) => \`\${n} of \${orders.length} orders\`} />
      <TableScroll>
        <DataTable table={table} aria-label="Orders" rowLabel={(row) => \`Select \${row.original.id}\`} />
      </TableScroll>
      <DataTablePagination table={table} noun="orders" />
    </TableFrame>
  )
}`;

const CONTROLLED = `const [sorting, setSorting] = useState<DataTableState["sorting"]>([{ id: "due", desc: false }])

const table = useDataTable({
  data: orders,
  columns,
  // the sort is yours; every other slice stays the table's
  state: { sorting },
  onStateChange: (next, { slice }) => {
    if (slice === "sorting") setSorting(next.sorting)
  },
  // a slice you leave to the table starts here
  defaultState: { pagination: { pageIndex: 0, pageSize: 25 } },
})`;

const URL_ADAPTER = `// An example adapter, not part of the item: keep the sort, search and page in the address bar.
function readUrl(params: URLSearchParams): Partial<DataTableState> {
  const sort = params.get("sort") // "due,-cases": a minus sorts descending
  return {
    sorting: sort
      ? sort.split(",").map((s) => ({ id: s.replace(/^-/, ""), desc: s.startsWith("-") }))
      : [],
    globalFilter: params.get("q") ?? "",
    pagination: { pageIndex: Number(params.get("page") ?? 1) - 1, pageSize: 25 },
  }
}

function writeUrl(state: DataTableState): string {
  const params = new URLSearchParams()
  if (state.sorting.length)
    params.set("sort", state.sorting.map((s) => (s.desc ? "-" : "") + s.id).join(","))
  if (state.globalFilter) params.set("q", state.globalFilter)
  if (state.pagination.pageIndex) params.set("page", String(state.pagination.pageIndex + 1))
  return params.size ? \`?\${params}\` : location.pathname
}

function Orders({ orders }: { orders: Order[] }) {
  const [url, setUrl] = useState(() => readUrl(new URLSearchParams(location.search)))
  const table = useDataTable({
    data: orders,
    columns,
    state: url,
    onStateChange: (next) => {
      setUrl({ sorting: next.sorting, globalFilter: next.globalFilter, pagination: next.pagination })
      history.replaceState(null, "", writeUrl(next))
    },
  })
  // …render as above
}`;

const FILTERS = `const columns: DataTableColumnDef<Shipment>[] = [
  // a DataTableFilter: { kind: "text", value } · { kind: "set", values } · { kind: "range", from?, to? }
  { accessorKey: "carrier", header: "Carrier", filterFn: "keyline" },
  { accessorKey: "eta", header: "ETA", filterFn: "keyline", sortingFn: "datetime" },
]

table.getColumn("carrier")?.setFilterValue({ kind: "set", values: ["DHL", "UPS"] })
table.getColumn("eta")?.setFilterValue({ kind: "range", from: monday, to: friday })`;

const PROPS: Prop[] = [
  {
    name: "useDataTable",
    type: "{ data, columns, state?, onStateChange?, defaultState?, getRowId?, enableRowSelection?, getRowCanExpand?, autoResetPageIndex?, autoResetExpanded? }",
    default: "—",
    description: (
      <>
        Returns the TanStack table. A slice in <code>state</code> is yours; any other is the table&apos;s, seeded from{" "}
        <code>defaultState</code>. <code>getRowId</code> defaults to the row&apos;s <code>id</code>. Set{" "}
        <code>autoResetPageIndex</code> and <code>autoResetExpanded</code> to <code>false</code> to keep the page and
        the open details when the data changes.
      </>
    ),
  },
  {
    name: "onStateChange",
    type: "(state: DataTableState, { slice }) => void",
    default: "—",
    description: "Every change, controlled or not, with the slice that changed.",
  },
  {
    name: "DataTable",
    type: "{ table, rowLabel?, selectAllLabel?, rowCode?, rowProps?, renderDetail?, expandLabel?, bodyProps?, caption?, loading?, error?, empty? }",
    default: "—",
    description: (
      <>
        The grid: sort headers, the index column, the rows, and <code>empty</code> when nothing matches.{" "}
        <code>renderDetail</code> adds an expand column and a detail under each expanded row; <code>loading</code> and{" "}
        <code>error</code> stand in for the rows; <code>bodyProps</code> go to the body (a <code>ref</code> for{" "}
        <code>useRowMotion</code>). Other props go to the <code>table</code> element.
      </>
    ),
  },
  {
    name: "DataTableBulkBar",
    type: "{ table, scope?, children? }",
    default: "—",
    description: (
      <>
        The selected count, announced politely. <code>scope</code> and <code>children</code> may be functions of the
        count.
      </>
    ),
  },
  {
    name: "DataTablePagination",
    type: "{ table, noun?, loading? }",
    default: "—",
    description: "The range of rows and previous / next.",
  },
  {
    name: "DataTableSearch",
    type: "{ table, label? }",
    default: "—",
    description: "A search over every column, the table's global filter.",
  },
  {
    name: "column meta",
    type: '{ align?: "end", cellClassName?: string }',
    default: "—",
    description: (
      <>
        End-aligns a column of figures; <code>cellClassName</code> goes to its body cells. <code>sortDescFirst</code>{" "}
        starts its sort high to low.
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
    label: "Guides",
    items: [
      { id: "controlled-state", label: "Controlled state" },
      { id: "state-in-the-url", label: "State in the URL" },
      { id: "filters", label: "Filters" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "keyboard-and-screen-readers", label: "Keyboard and screen readers" },
      { id: "props", label: "Props" },
    ],
  },
];

export default function DataTablePage() {
  return (
    <DocPage name="Data table" toc={TOC}>
      <h1>Data table</h1>
      <p className="s-doc-lede">
        TanStack Table works out the rows: sorted, filtered, paged and selected. Keyline&apos;s{" "}
        <a href="/docs/components/table">table parts</a> draw them. You give it rows and columns; selecting a row
        re-renders that row alone.
      </p>

      <ComponentDemo
        label="Data table example"
        preview={<DataTableOrders />}
        code={<ExampleCode file="data-table-orders.tsx" label="example code" />}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />
      <p className="s-small">
        It installs <code>@tanstack/react-table</code> at the version Keyline is tested with, and the table item.
      </p>

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
      <p>
        Define the columns outside the component, or in a <code>useMemo</code>: a new array rebuilds every column. Shift
        on a header adds it as a further sort level, and Shift on a checkbox selects the range from the last row you
        toggled.
      </p>

      <h2 id="controlled-state">Controlled state</h2>
      <p>
        The table keeps seven slices: <code>sorting</code>, <code>columnFilters</code>, <code>globalFilter</code>,{" "}
        <code>pagination</code>, <code>rowSelection</code>, <code>columnVisibility</code> and <code>expanded</code>.
        Pass a slice in <code>state</code> to own it, and write back what <code>onStateChange</code> gives you. The rest
        stay the table&apos;s. <code>onStateChange</code> reports those too, so you can follow them without owning them.
      </p>
      <CodeBlock code={CONTROLLED} lang="tsx" copyLabel="controlled state" />

      <h2 id="state-in-the-url">State in the URL</h2>
      <p>
        An adapter is a pair of functions between the state and the address bar. This one is an example to copy and
        adapt; the item does not include it, and a router&apos;s search params work the same way.
      </p>
      <CodeBlock code={URL_ADAPTER} lang="tsx" copyLabel="URL adapter" />

      <h2 id="filters">Filters</h2>
      <p>
        <code>filterFn: &quot;keyline&quot;</code> filters a column by a <code>DataTableFilter</code>: text (ignoring
        case and accents), a set of values, or a range of numbers or dates. A filter with nothing in it removes itself.
      </p>
      <CodeBlock code={FILTERS} lang="tsx" copyLabel="filters" />

      <h2 id="keyboard-and-screen-readers">Keyboard and screen readers</h2>
      <p>
        Each sort header is a button: Enter or Space sorts, Shift adds a level. The first sorted column carries{" "}
        <code>aria-sort</code>; later levels say their place, &ldquo;sort 2 of 2, descending&rdquo;. Selected rows carry{" "}
        <code>aria-selected</code>, and the bulk bar announces its count politely. Name the table with{" "}
        <code>aria-label</code> or <code>caption</code>.
      </p>

      <h2 id="props">Props</h2>
      <PropsReference label="Data table props" props={PROPS} />
      <p className="s-small">
        <code>useDataTable</code> returns TanStack&apos;s own table, so its API works as documented there:{" "}
        <code>table.getColumn(id)</code>, <code>table.resetRowSelection()</code>,{" "}
        <code>table.getSelectedRowModel()</code>.
      </p>
    </DocPage>
  );
}

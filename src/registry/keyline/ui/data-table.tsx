"use client";

import * as React from "react";
import {
  FlexRender,
  Subscribe,
  columnFilteringFeature,
  columnVisibilityFeature,
  constructFilterFn,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  functionalUpdate,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Header,
  type PaginationState,
  type ReactTable,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type TableState,
  type Updater,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableBulkBar,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableIndexCell,
  TablePagination,
  TableRow,
  TableSearch,
  TableSortHeader,
  TableState as TableStateRow,
  type TableBulkBarProps,
  type TableRowProps,
} from "./table";
import type { PartProps } from "../lib/keyline-render";
import {
  columnAlign,
  isFilterActive,
  matchesFilter,
  matchesSearch,
  nextSorting,
  rowCode,
  sortLevelOf,
  type DataTableFilter,
} from "../lib/data-table";

/* ------------------------------------------------------------------ *
 * DATA TABLE: TanStack Table (v9) driving Keyline's table parts.
 *
 *   const table = useDataTable({ data, columns, getRowId: (r) => r.id })
 *   <TableFrame>
 *     <DataTableBulkBar table={table}>…actions…</DataTableBulkBar>
 *     <TableScroll><DataTable table={table} rowLabel={(r) => `Select ${r.original.id}`} /></TableScroll>
 *     <DataTablePagination table={table} noun="shipments" />
 *   </TableFrame>
 *
 * TanStack owns the models (sorted, filtered, paged rows) and the state; the Keyline parts own the markup,
 * keyboard and accessibility. State is controlled or not, slice by slice: a slice given in `state` is the
 * caller's (keep it in sync from `onStateChange`), any other slice is the table's, seeded from `defaultState`.
 * `onStateChange(next, eventDetails)` reports every change either way, so a URL adapter can follow the table.
 *
 * Rendering is narrow. Each row subscribes to its own entry in the selection, so selecting a row re-renders that
 * row alone; the header's select-all and the bulk bar subscribe to the selection themselves. The owner of
 * useDataTable re-renders for sorting, filters, paging and column visibility, not for selection.
 * ------------------------------------------------------------------ */

/** Filter functions, by name: `filterFn: "keyline"` on a column takes a DataTableFilter (lib/data-table). */
const keylineFilter = constructFilterFn({
  filter: (value: unknown, filter: DataTableFilter) => matchesFilter(value, filter),
  autoRemove: (filter: DataTableFilter | undefined) => !isFilterActive(filter),
});
const keylineSearch = constructFilterFn({
  filter: (value: unknown, search: string) => matchesSearch([value], search),
  autoRemove: (search: unknown) => typeof search !== "string" || search.trim() === "",
});

/** The features every Data Table registers. Each row model comes after the feature it needs. */
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime, text: sortFn_text },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { keyline: keylineFilter, search: keylineSearch },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnVisibilityFeature,
});

type Features = typeof features;

/** A column of a Data Table. `meta: { align: "end" }` aligns a column of figures; `sortDescFirst` makes it sort
 *  high-to-low first; `filterFn: "keyline"` filters it by a DataTableFilter. */
export type DataTableColumnDef<TData extends RowData> = ColumnDef<Features, TData, any>;
export type DataTableInstance<TData extends RowData> = ReactTable<Features, TData, any>;

/** The state a Data Table keeps: TanStack's slices, by TanStack's names. */
export type DataTableState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  pagination: PaginationState;
  rowSelection: RowSelectionState;
  columnVisibility: ColumnVisibilityState;
};
export type DataTableSlice = keyof DataTableState;
export type DataTableChangeDetails = { slice: DataTableSlice };

const SLICES = [
  "sorting",
  "columnFilters",
  "globalFilter",
  "pagination",
  "rowSelection",
  "columnVisibility",
] as const satisfies readonly DataTableSlice[];
// every slice of DataTableState is wired: a slice missing from SLICES fails to compile here
type Unwired = Exclude<DataTableSlice, (typeof SLICES)[number]>;
const allWired: Unwired extends never ? true : false = true;
void allWired;

const DEFAULT_STATE: DataTableState = {
  sorting: [],
  columnFilters: [],
  globalFilter: "",
  pagination: { pageIndex: 0, pageSize: 10 },
  rowSelection: {},
  columnVisibility: {},
};

const HANDLER = {
  sorting: "onSortingChange",
  columnFilters: "onColumnFiltersChange",
  globalFilter: "onGlobalFilterChange",
  pagination: "onPaginationChange",
  rowSelection: "onRowSelectionChange",
  columnVisibility: "onColumnVisibilityChange",
} as const satisfies Record<DataTableSlice, `on${string}Change`>;

export type UseDataTableOptions<TData extends RowData> = {
  data: readonly TData[];
  /** Keep the columns stable (module scope or a memo): a new array rebuilds every column. */
  columns: readonly DataTableColumnDef<TData>[];
  /** The slices the caller controls. Write `onStateChange`'s value back for each one. */
  state?: Partial<DataTableState>;
  /** Called with the table's next state and `{ slice }`, the slice that changed, for controlled and uncontrolled
   *  slices alike. */
  onStateChange?: (state: DataTableState, eventDetails: DataTableChangeDetails) => void;
  /** Seeds for the slices the table controls (the page size, an initial sort). */
  defaultState?: Partial<DataTableState>;
  /** The row's id: selection is kept by id, so make it stable across sorting and paging. Default: `row.id`, else
   *  the row's index. */
  getRowId?: (row: TData, index: number) => string;
  /** Which rows can be selected; false turns selection off (no index column). Default: every row. */
  enableRowSelection?: boolean | ((row: Row<Features, TData>) => boolean);
  /** The rows are one page from a server: pass `rowCount`, the total. */
  manualPagination?: boolean;
  /** The rows are sorted and filtered by a server. */
  manualSorting?: boolean;
  manualFiltering?: boolean;
  rowCount?: number;
  /** Return to the first page when data, filters or sorting change. Default true. */
  autoResetPageIndex?: boolean;
};

const defaultRowId = (row: unknown, index: number) => {
  const id = (row as { id?: unknown } | null)?.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : String(index);
};

/** What the owner of useDataTable re-renders for: everything but the selection, which the rows, the header's
 *  select-all and the bulk bar read for themselves. */
const ownerSlices = (state: TableState<Features>) => ({
  sorting: state.sorting,
  columnFilters: state.columnFilters,
  globalFilter: state.globalFilter as string,
  pagination: state.pagination,
  columnVisibility: state.columnVisibility,
});

/**
 * A TanStack table with Keyline's features registered (sorting, filtering, a search, paging, selection, column
 * visibility). Pass it to DataTable, DataTableBulkBar, DataTablePagination and DataTableSearch.
 */
function useDataTable<TData extends RowData>({
  data,
  columns,
  state,
  onStateChange,
  defaultState,
  getRowId = defaultRowId,
  enableRowSelection = true,
  manualPagination,
  manualSorting,
  manualFiltering,
  rowCount,
  autoResetPageIndex,
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const latest = React.useRef({ state, onStateChange });
  React.useLayoutEffect(() => {
    latest.current = { state, onStateChange };
  });
  const tableRef = React.useRef<DataTableInstance<TData> | null>(null);
  // one stable handler per slice: a controlled slice goes to the caller; the table's own slice is written to its
  // atom (as TanStack's default handler does) and reported
  const [handlers] = React.useState(() => {
    const out: Record<string, (updater: Updater<unknown>) => void> = {};
    for (const slice of SLICES) {
      out[HANDLER[slice]] = (updater) => {
        const table = tableRef.current;
        if (!table) return;
        const { state: controlled, onStateChange: report } = latest.current;
        const own = controlled?.[slice] === undefined;
        const atoms = table.atoms as unknown as Record<DataTableSlice, { get(): unknown }>;
        const prev = own ? atoms[slice].get() : controlled[slice];
        const next = functionalUpdate(updater, prev);
        if (Object.is(next, prev)) return;
        if (own) (table.baseAtoms as unknown as Record<DataTableSlice, { set(v: unknown): void }>)[slice].set(next);
        if (report) {
          const current = {} as Record<DataTableSlice, unknown>;
          for (const s of SLICES) current[s] = controlled?.[s] !== undefined ? controlled[s] : atoms[s].get();
          current[slice] = next;
          report(current as DataTableState, { slice });
        }
      };
    }
    return out;
  });
  const controlledState: Partial<DataTableState> = {};
  if (state)
    for (const s of SLICES) if (state[s] !== undefined) (controlledState as Record<string, unknown>)[s] = state[s];
  const table = useTable(
    {
      features,
      data: data as TData[],
      columns: columns as DataTableColumnDef<TData>[],
      getRowId,
      initialState: { ...DEFAULT_STATE, ...defaultState },
      state: controlledState,
      ...handlers,
      enableRowSelection,
      enableMultiSort: true,
      isRowRangeSelectionEvent: (e: unknown) => !!(e as { shiftKey?: boolean } | null)?.shiftKey,
      manualPagination,
      manualSorting,
      manualFiltering,
      rowCount,
      autoResetPageIndex,
      globalFilterFn: "search",
    },
    ownerSlices,
  ) as unknown as DataTableInstance<TData>;
  tableRef.current = table;
  return table;
}

/* ------------------------------------------------------------------ *
 * PARTS
 * ------------------------------------------------------------------ */

type DataTableProps<TData extends RowData> = Omit<PartProps<"table", Record<string, never>>, "children"> & {
  table: DataTableInstance<TData>;
  /** The selection checkbox's name for a row ("Select SH-20481"). Default: "Select row" and its code. */
  rowLabel?: (row: Row<Features, TData>) => string;
  /** The select-all checkbox's name. */
  selectAllLabel?: string;
  /** The index column's code for a row: its place across pages ("01") by default; null prints none. */
  rowCode?: ((row: Row<Features, TData>, index: number) => React.ReactNode) | null;
  /** Props for a row's TableRow (an onClick, a data attribute). Keep the function stable: a new one re-renders
   *  every row. */
  rowProps?: (row: Row<Features, TData>) => Omit<TableRowProps, "selected">;
  /** The table's name, read before its rows (a TableCaption). */
  caption?: React.ReactNode;
  /** What shows when no row passes the filters (an Empty spanning the grid). */
  empty?: { title: React.ReactNode; body?: React.ReactNode; action?: React.ReactNode; count?: React.ReactNode };
};

/** The rows of a TanStack table as Keyline table parts: sort headers with aria-sort and the sort order, an index
 *  column of selection checkboxes (Shift extends a range), and an empty row. Put it in a TableScroll. */
function DataTable<TData extends RowData>({
  table,
  rowLabel,
  selectAllLabel = "Select this page",
  rowCode: code,
  rowProps,
  caption,
  empty,
  ...props
}: DataTableProps<TData>): React.ReactElement {
  const { sorting, pagination } = table.state as ReturnType<typeof ownerSlices>;
  const selectable = table.options.enableRowSelection !== false;
  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns();
  // a row re-renders when the columns it shows change; its cells are read through the row, which stays the same
  const shown = columns.map((c) => c.id).join("\u0000");
  return (
    <Table {...props}>
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        {table.getHeaderGroups().map((group, g) => (
          <TableRow key={group.id}>
            {selectable && g === table.getHeaderGroups().length - 1 ? (
              <DataTableSelectAll table={table} label={selectAllLabel} />
            ) : selectable ? (
              <TableHead aria-hidden />
            ) : null}
            {group.headers.map((header) => (
              <DataTableColumnHeader key={header.id} header={header} sorting={sorting} />
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length === 0 && empty ? (
          <TableStateRow
            kind="empty"
            colSpan={columns.length + (selectable ? 1 : 0)}
            count={empty.count ?? 0}
            title={empty.title}
            body={empty.body}
            action={empty.action}
          />
        ) : (
          rows.map((row, i) => (
            <DataTableRow
              key={row.id}
              row={row as DataTableRowProps["row"]}
              shown={shown}
              selectable={selectable}
              code={
                code === null
                  ? undefined
                  : code
                    ? code(row, i)
                    : rowCode(table.options.manualPagination ? 0 : pagination.pageIndex, pagination.pageSize, i)
              }
              label={rowLabel ? rowLabel(row) : `Select row ${rowCode(pagination.pageIndex, pagination.pageSize, i)}`}
              rowProps={rowProps as DataTableRowProps["rowProps"]}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}

function DataTableColumnHeader<TData extends RowData>({
  header,
  sorting,
}: {
  header: Header<Features, TData, unknown>;
  sorting: SortingState;
}): React.ReactElement {
  if (header.isPlaceholder) return <TableHead colSpan={header.colSpan} />;
  const column = header.column;
  const align = columnAlign(column.columnDef.meta);
  const label = <FlexRender header={header} />;
  if (!column.getCanSort())
    return (
      <TableHead align={align} colSpan={header.colSpan > 1 ? header.colSpan : undefined}>
        {label}
      </TableHead>
    );
  const level = sortLevelOf(sorting, column.id);
  return (
    <TableSortHeader
      align={align}
      colSpan={header.colSpan > 1 ? header.colSpan : undefined}
      sort={level?.direction ?? null}
      priority={level?.priority}
      levels={sorting.length}
      onSort={({ additive }) =>
        column.table.setSorting((old) =>
          nextSorting(old, column.id, {
            first: column.columnDef.sortDescFirst ? "descending" : "ascending",
            additive: additive && column.getCanMultiSort(),
          }),
        )
      }
    >
      {label}
    </TableSortHeader>
  );
}

/** The header's select-all checkbox: checked when every row on the page is, mixed when some are. */
function DataTableSelectAll<TData extends RowData>({
  table,
  label,
}: {
  table: DataTableInstance<TData>;
  label: string;
}): React.ReactElement {
  return (
    <Subscribe
      source={table.atoms.rowSelection}
      selector={() => (table.getIsAllPageRowsSelected() ? "all" : table.getIsSomePageRowsSelected() ? "some" : "none")}
    >
      {(page) => (
        <TableIndexCell
          header
          checked={page === "all"}
          indeterminate={page === "some"}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
          label={label}
        />
      )}
    </Subscribe>
  );
}

type DataTableRowProps = {
  row: Row<Features, any>;
  /** the visible columns' ids, so the row re-renders when they change */
  shown: string;
  selectable: boolean;
  code: React.ReactNode;
  label: string;
  rowProps: ((row: Row<Features, any>) => Omit<TableRowProps, "selected">) | undefined;
};

/** One row. Memoised, and subscribed to its own selection entry: toggling a row re-renders that row alone. */
const DataTableRow = React.memo(function DataTableRow({
  row,
  selectable,
  code,
  label,
  rowProps,
}: DataTableRowProps): React.ReactElement {
  return (
    <Subscribe source={row.table.atoms.rowSelection} selector={(selection) => !!selection?.[row.id]}>
      {(selected) => (
        <TableRow {...rowProps?.(row)} selected={selected} aria-selected={selectable ? selected : undefined}>
          {selectable ? (
            <TableIndexCell
              checked={selected}
              onCheckedChange={(checked, eventDetails) =>
                // TanStack's handler reads the checkbox's new value, and Shift for a range from the last row toggled
                row.getToggleSelectedHandler()({
                  target: { checked },
                  shiftKey: (eventDetails.event as { shiftKey?: boolean } | undefined)?.shiftKey ?? false,
                })
              }
              code={code}
              label={label}
            />
          ) : null}
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} align={columnAlign(cell.column.columnDef.meta)}>
              <FlexRender cell={cell} />
            </TableCell>
          ))}
        </TableRow>
      )}
    </Subscribe>
  );
});

type DataTableBulkBarProps<TData extends RowData> = Omit<TableBulkBarProps, "count" | "scope" | "children"> & {
  table: DataTableInstance<TData>;
  /** what the selection covers; a function of the selected count */
  scope?: React.ReactNode | ((count: number) => React.ReactNode);
  /** the actions; a function of the selected count (to disable them at 0) */
  children?: React.ReactNode | ((count: number) => React.ReactNode);
};

/** The bulk bar over a Data Table's selection: the count (announced politely), the scope, the actions. It
 *  re-renders on its own when the selection changes. */
function DataTableBulkBar<TData extends RowData>({
  table,
  scope,
  children,
  ...props
}: DataTableBulkBarProps<TData>): React.ReactElement {
  return (
    <Subscribe
      source={table.atoms.rowSelection}
      selector={(selection) => Object.values(selection ?? {}).filter(Boolean).length}
    >
      {(count) => (
        <TableBulkBar {...props} count={count} scope={typeof scope === "function" ? scope(count) : scope}>
          {typeof children === "function" ? children(count) : children}
        </TableBulkBar>
      )}
    </Subscribe>
  );
}

/** The pager over a Data Table: the range of rows shown, the page, previous and next. */
function DataTablePagination<TData extends RowData>({
  table,
  noun,
  loading,
  children,
  className,
}: {
  table: DataTableInstance<TData>;
  /** what the rows are ("shipments") */
  noun?: string;
  /** while data loads the range shows "–" and the buttons are off */
  loading?: boolean;
  /** fills the cell between the range and the buttons (a ToastDock) */
  children?: React.ReactNode;
  className?: string;
}): React.ReactElement {
  const { pagination } = table.state as ReturnType<typeof ownerSlices>;
  return (
    <TablePagination
      page={pagination.pageIndex}
      pageSize={pagination.pageSize}
      total={loading ? null : table.getRowCount()}
      onPageChange={(page) => table.setPageIndex(page)}
      noun={noun}
      className={className}
    >
      {children}
    </TablePagination>
  );
}

/** The toolbar's search box, bound to the table's global filter (every column's text). */
function DataTableSearch<TData extends RowData>({
  table,
  ...props
}: Omit<React.ComponentProps<typeof TableSearch>, "value" | "onChange"> & {
  table: DataTableInstance<TData>;
}): React.ReactElement {
  const { globalFilter } = table.state as ReturnType<typeof ownerSlices>;
  return <TableSearch {...props} value={globalFilter ?? ""} onChange={(e) => table.setGlobalFilter(e.target.value)} />;
}

export {
  useDataTable,
  DataTable,
  DataTableBulkBar,
  DataTablePagination,
  DataTableSearch,
  type DataTableProps,
  type DataTableBulkBarProps,
  type DataTableFilter,
};

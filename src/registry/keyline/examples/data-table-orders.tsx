"use client";

import { Button } from "../ui/button";
import {
  DataTable,
  DataTableBulkBar,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
  type DataTableColumnDef,
} from "../ui/data-table";
import { Status, TableFrame, TableScroll, TableToolbar } from "../ui/table";
import type { StatusKind } from "../ui/status";

type State = "out" | "loading" | "held" | "delivered";
type Order = { id: string; client: string; rep: string; cases: number; due: string; state: State };

const ORDERS: Order[] = [
  { id: "DM-4102", client: "Scranton Business Park", rep: "Dwight", cases: 40, due: "2026-11-12", state: "out" },
  { id: "DM-4107", client: "Lackawanna County", rep: "Dwight", cases: 120, due: "2026-11-12", state: "out" },
  { id: "DM-4111", client: "Vance Refrigeration", rep: "Phyllis", cases: 6, due: "2026-11-11", state: "held" },
  { id: "DM-4115", client: "Blue Cross of Pennsylvania", rep: "Jim", cases: 60, due: "2026-11-13", state: "loading" },
  { id: "DM-4118", client: "Harper Collins", rep: "Stanley", cases: 24, due: "2026-11-16", state: "loading" },
  { id: "DM-4120", client: "Scranton White Pages", rep: "Andy", cases: 10, due: "2026-11-09", state: "delivered" },
  { id: "DM-4123", client: "Mount Airy Casino", rep: "Jim", cases: 35, due: "2026-11-17", state: "loading" },
  { id: "DM-4126", client: "Lackawanna County", rep: "Dwight", cases: 80, due: "2026-11-10", state: "delivered" },
  { id: "DM-4129", client: "Penn Paper Supply", rep: "Phyllis", cases: 15, due: "2026-11-11", state: "held" },
  { id: "DM-4131", client: "Wilkes-Barre Library", rep: "Stanley", cases: 18, due: "2026-11-18", state: "out" },
  { id: "DM-4134", client: "Sabre", rep: "Andy", cases: 300, due: "2026-11-19", state: "loading" },
];

const SAY: Record<State, [StatusKind, string]> = {
  loading: ["waiting", "Loading"],
  out: ["normal", "Out for delivery"],
  held: ["attention", "Held"],
  delivered: ["done", "Delivered"],
};

const day = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

// module scope: the columns stay the same object from render to render
const COLUMNS: DataTableColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order",
    cell: ({ getValue }) => <span className="font-kl-mono text-[13px]">{getValue() as string}</span>,
  },
  { accessorKey: "client", header: "Client" },
  { accessorKey: "rep", header: "Rep", enableSorting: false },
  { accessorKey: "cases", header: "Cases", sortDescFirst: true, meta: { align: "end" } },
  {
    accessorKey: "due",
    header: "Due",
    cell: ({ getValue }) => day.format(new Date(getValue() as string)),
  },
  {
    accessorKey: "state",
    header: "Status",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ getValue }) => {
      const [kind, say] = SAY[getValue() as State];
      return <Status kind={kind}>{say}</Status>;
    },
  },
];

export function OrdersDataTable() {
  const table = useDataTable({
    data: ORDERS,
    columns: COLUMNS,
    defaultState: { sorting: [{ id: "due", desc: false }], pagination: { pageIndex: 0, pageSize: 5 } },
  });
  return (
    <TableFrame>
      <TableToolbar>
        <DataTableSearch table={table} label="Search orders" placeholder="Search orders" />
      </TableToolbar>
      <DataTableBulkBar
        table={table}
        scope={(n) => (n ? `${n} of ${ORDERS.length} orders` : "Select orders to act on them")}
      >
        {(n) => (
          <Button layout="cell" disabled={n === 0} onClick={() => table.resetRowSelection()}>
            Clear
          </Button>
        )}
      </DataTableBulkBar>
      <TableScroll>
        <DataTable
          table={table}
          aria-label="Open orders"
          rowLabel={(row) => `Select ${row.original.id}`}
          empty={{ title: "No orders match", body: "Try another client, order or rep." }}
        />
      </TableScroll>
      <DataTablePagination table={table} noun="orders" />
    </TableFrame>
  );
}

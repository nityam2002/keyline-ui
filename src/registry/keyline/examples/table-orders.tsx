"use client";

import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  Status,
  Table,
  TableBody,
  TableBulkBar,
  TableCell,
  TableFrame,
  TableHeader,
  TableHead,
  TableIndexCell,
  TablePagination,
  TableRow,
  TableScroll,
  TableSearch,
  TableSortHeader,
  TableState,
  TableToolbar,
  TableViews,
  compareValues,
  nextSort,
  sortOf,
  type Sort,
} from "../ui/table";
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

type Key = "id" | "client" | "cases" | "due";
const PAGE = 5;
const day = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

export function OpenOrders() {
  const [orders, setOrders] = useState(ORDERS);
  const [view, setView] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort<Key>>({ key: "due", direction: "ascending" });
  const [page, setPage] = useState(0);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const hit = orders.filter(
      (o) =>
        (view === "all" || (view === "held" ? o.state === "held" : o.state === "delivered")) &&
        (!term ||
          o.client.toLowerCase().includes(term) ||
          o.id.toLowerCase().includes(term) ||
          o.rep.toLowerCase().includes(term)),
    );
    return sort ? hit.sort((a, b) => compareValues(a[sort.key], b[sort.key], sort.direction)) : hit;
  }, [orders, view, q, sort]);

  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const onPage = shown.filter((o) => picked.has(o.id)).length;
  const reset = () => (setPage(0), setPicked(new Set()));
  const pick = (id: string, on: boolean) =>
    setPicked((p) => {
      const n = new Set(p);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  const deliver = () => {
    setOrders((all) => all.map((o) => (picked.has(o.id) ? { ...o, state: "delivered" } : o)));
    setPicked(new Set());
  };
  const head = (key: Key, label: string, align?: "end", first?: "descending") => (
    <TableSortHeader
      align={align}
      sort={sortOf(sort, key)}
      onSort={() => (setSort((s) => nextSort(s, key, { first })), setPage(0))}
    >
      {label}
    </TableSortHeader>
  );
  const count = (f: (o: Order) => boolean) => orders.filter(f).length;

  return (
    <TableFrame>
      <TableViews
        label="Orders"
        value={view}
        onValueChange={(v) => (setView(v), reset())}
        views={[
          { value: "all", label: "All", count: orders.length },
          { value: "held", label: "Held", count: count((o) => o.state === "held") },
          { value: "delivered", label: "Delivered", count: count((o) => o.state === "delivered") },
        ]}
      />
      <TableToolbar aria-label="Filter orders">
        <TableSearch
          label="Search orders"
          placeholder="Client, order or rep"
          value={q}
          onChange={(e) => (setQ(e.target.value), reset())}
        />
      </TableToolbar>
      <TableBulkBar
        count={picked.size}
        scope={picked.size ? `${picked.size} of ${rows.length} orders` : "Select orders to act on them."}
      >
        <Button layout="cell" variant="primary" disabled={!picked.size} onClick={deliver}>
          Mark delivered
        </Button>
      </TableBulkBar>
      <TableScroll>
        <Table aria-label="Orders">
          <TableHeader>
            <tr>
              <TableIndexCell
                header
                label="Select every order on this page"
                checked={shown.length > 0 && onPage === shown.length}
                indeterminate={onPage > 0 && onPage < shown.length}
                onCheckedChange={(on) => shown.forEach((o) => pick(o.id, on))}
              />
              {head("id", "Order")}
              {head("client", "Client")}
              {head("cases", "Cases", "end", "descending")}
              {head("due", "Due")}
              <TableHead>Status</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {shown.length ? (
              shown.map((o, i) => {
                const [kind, words] = SAY[o.state];
                return (
                  <TableRow key={o.id} selected={picked.has(o.id)}>
                    <TableIndexCell
                      checked={picked.has(o.id)}
                      onCheckedChange={(on) => pick(o.id, on)}
                      code={String(page * PAGE + i + 1).padStart(2, "0")}
                      label={`Select ${o.id}`}
                    />
                    <TableCell className="font-kl-mono text-[13px]">{o.id}</TableCell>
                    <TableCell>
                      {o.client} <span className="text-kl-ink-3">· {o.rep}</span>
                    </TableCell>
                    <TableCell align="end">{o.cases}</TableCell>
                    <TableCell>{day.format(new Date(o.due))}</TableCell>
                    <TableCell>
                      <Status kind={kind}>{words}</Status>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableState
                kind="empty"
                colSpan={6}
                count={0}
                title={q ? `No orders match “${q.trim()}”` : "No orders in this view"}
                body={view === "all" ? "Search by client, order number or rep." : "Other views may have it."}
                action={
                  <Button onClick={() => (setQ(""), setView("all"), reset())}>
                    {q ? "Clear search" : "Show all orders"}
                  </Button>
                }
              />
            )}
          </TableBody>
        </Table>
      </TableScroll>
      <TablePagination page={page} pageSize={PAGE} total={rows.length} onPageChange={setPage} noun="orders" />
    </TableFrame>
  );
}

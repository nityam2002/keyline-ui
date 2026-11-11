import * as React from "react"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { TableFrame,TableScroll,Table,TableHead,TableBody,TableRow,TableCell,TableSortHeader,TableHeaderCell,TableState,TablePagination,nextSort,sortOf,compareValues,type Sort } from "@/registry/keyline/ui/table"
import { Status } from "@/registry/keyline/ui/status"

/* ------------------------------------------------------------------ */
type Row = { ref: string; dest: string; eta: Date; kg: number; state: "transit" | "delayed" | "done" }
const ROWS: Row[] = [
  { ref: "SH-9", dest: "Rotterdam", eta: new Date(2026, 10, 12), kg: 18200, state: "transit" },
  { ref: "SH-10", dest: "Antwerp", eta: new Date(2026, 10, 10), kg: 9400, state: "delayed" },
  { ref: "SH-2", dest: "Hamburg", eta: new Date(2026, 10, 14), kg: 22650, state: "transit" },
  { ref: "SH-31", dest: "Bremerhaven", eta: new Date(2026, 10, 9), kg: 6100, state: "done" },
  { ref: "SH-4", dest: "Duisburg", eta: new Date(2026, 10, 11), kg: 12800, state: "transit" },
  { ref: "SH-17", dest: "Le Havre", eta: new Date(2026, 10, 13), kg: 15300, state: "delayed" },
]
type Key = "ref" | "dest" | "eta" | "kg"
export function SortTableSpecimen() {
  const [sort, setSort] = React.useState<Sort<Key>>({ key: "eta", direction: "ascending" })
  const [page, setPage] = React.useState(0)
  const [filterEmpty, setFilterEmpty] = React.useState(false)
  const rows = React.useMemo(() => (sort ? [...ROWS].sort((a, b) => compareValues(a[sort.key], b[sort.key], sort.direction)) : ROWS), [sort])
  const shown = filterEmpty ? [] : rows.slice(page * 4, page * 4 + 4)
  const head = (key: Key, label: string, align?: "end", first?: "descending") => (
    <TableSortHeader align={align} sort={sortOf(sort, key)} onSort={() => (setSort((s) => nextSort(s, key, { first })), setPage(0))}>
      {label}
    </TableSortHeader>
  )
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" })
  return (
    <div className={ui.stack}>
      <div className={ui.row}>
        <Button size="compact" onClick={() => setFilterEmpty((v) => !v)}>{filterEmpty ? "Show rows" : "Filter to nothing"}</Button>
      </div>
      <TableFrame className="max-h-none">
        <TableScroll>
          <Table aria-label="Shipments, sortable">
            <TableHead>
              <tr>
                {head("ref", "Reference")}
                {head("dest", "Destination")}
                {head("eta", "ETA")}
                {head("kg", "Gross weight (kg)", "end", "descending")}
                <TableHeaderCell>Status</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {shown.length ? (
                shown.map((r) => (
                  <TableRow key={r.ref}>
                    <TableCell><span className="kl-code">{r.ref}</span></TableCell>
                    <TableCell>{r.dest}</TableCell>
                    <TableCell>{fmt.format(r.eta)}</TableCell>
                    <TableCell align="end">{r.kg.toLocaleString("en-GB")}</TableCell>
                    <TableCell>
                      <Status kind={r.state === "delayed" ? "attention" : r.state === "done" ? "done" : "normal"}>{r.state === "delayed" ? "Delayed" : r.state === "done" ? "Delivered" : "In transit"}</Status>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableState kind="empty" count={0} title="No shipments match" body="The filter excludes every row." action={<Button onClick={() => setFilterEmpty(false)}>Clear filter</Button>} colSpan={5} />
              )}
            </TableBody>
          </Table>
        </TableScroll>
        <TablePagination page={page} pageSize={4} total={filterEmpty ? 0 : ROWS.length} onPageChange={setPage} noun="shipments" />
      </TableFrame>
      <p className={ui.note} data-testid="sort-state">
        Sorted by {sort ? `${sort.key}, ${sort.direction}` : "nothing (original order)"}
      </p>
    </div>
  )
}

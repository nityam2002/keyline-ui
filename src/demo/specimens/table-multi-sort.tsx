import * as React from "react"
import * as ui from "../demo-ui"
import {
TableFrame,TableScroll,Table,TableHead,TableBody,TableRow,TableSortHeader,TableCell,
nextSortList,sortLevel,compareBy,type SortList,type SortDirection,
} from "@/registry/keyline/ui/table"

/* ------------------------------------------------------------------ *
 * 2. Multi-column sort
 * ------------------------------------------------------------------ */
type Dock = { dock: string; carrier: string; slot: string; pallets: number }
const DOCKS: Dock[] = [
  { dock: "D2", carrier: "Maersk", slot: "08:00", pallets: 12 },
  { dock: "D1", carrier: "DHL Freight", slot: "09:30", pallets: 8 },
  { dock: "D2", carrier: "DHL Freight", slot: "07:15", pallets: 20 },
  { dock: "D1", carrier: "Maersk", slot: "07:15", pallets: 8 },
  { dock: "D3", carrier: "Rhenus Road", slot: "10:00", pallets: 15 },
  { dock: "D1", carrier: "Rhenus Road", slot: "08:45", pallets: 33 },
  { dock: "D2", carrier: "Maersk", slot: "11:30", pallets: 5 },
]
type DockKey = keyof Dock
const DOCK_COLS: { key: DockKey; label: string; align?: "end"; first?: SortDirection }[] = [
  { key: "dock", label: "Dock" },
  { key: "carrier", label: "Carrier" },
  { key: "slot", label: "Slot", align: "end" },
  { key: "pallets", label: "Pallets", align: "end", first: "descending" },
]
export function MultiSortSpecimen() {
  const [sort, setSort] = React.useState<SortList<DockKey>>([{ key: "dock", direction: "ascending" }, { key: "slot", direction: "ascending" }])
  const rows = React.useMemo(() => [...DOCKS].sort(compareBy(sort, (r, k) => r[k], "en-GB")), [sort])
  return (
    <div className={ui.stack} data-testid="specimen-sort">
      <TableFrame aria-label="Dock slots" style={{ maxWidth: 620 }}>
        <TableScroll>
          <Table>
            <TableHead>
              <tr>
                {DOCK_COLS.map((c) => {
                  const lv = sortLevel(sort, c.key)
                  return (
                    <TableSortHeader
                      key={c.key}
                      align={c.align}
                      sort={lv?.direction ?? null}
                      priority={lv?.priority}
                      levels={sort.length}
                      onSort={({ additive }) => setSort((x) => nextSortList(x, c.key, { first: c.first, additive }))}
                    >
                      {c.label}
                    </TableSortHeader>
                  )
                })}
              </tr>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="kl-id">{r.dock}</TableCell>
                  <TableCell>{r.carrier}</TableCell>
                  <TableCell align="end">{r.slot}</TableCell>
                  <TableCell align="end">{r.pallets}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      </TableFrame>
      <p className={ui.note} data-testid="sort-levels">
        {sort.length ? `Sorted by ${sort.map((s) => `${s.key} ${s.direction}`).join(", then ")}` : "Not sorted"} · Shift + press a header to add, flip or drop a level
      </p>
    </div>
  )
}

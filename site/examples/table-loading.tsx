"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Table, TableBody, TableCell, TableFrame, TableHead, TableHeaderCell, TableLoadingRows, TablePagination, TableRow, TableScroll, TableState } from "@/components/keyline/ui/table"

const INVOICES = [
  ["INV-2207", "Scranton Business Park", "$1,284.00"],
  ["INV-2208", "Lackawanna County", "$9,610.00"],
  ["INV-2164", "Harper Collins", "$2,450.00"],
  ["INV-2211", "Blue Cross of Pennsylvania", "$4,980.00"],
]

type State = "loading" | "error" | "ready"

export function InvoiceTable() {
  const [state, setState] = useState<State>("loading")
  const failed = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const load = () => {
    setState("loading")
    // the first load fails, as Angela's accounting server does after lunch; the retry works
    timer.current = setTimeout(() => {
      setState(failed.current ? "ready" : "error")
      failed.current = true
    }, 1200)
  }
  useEffect(() => {
    load()
    return () => clearTimeout(timer.current)
  }, [])

  return (
    <TableFrame>
      <TableScroll>
        <Table aria-label="Unpaid invoices" aria-busy={state === "loading" || undefined}>
          <TableHead>
            <tr>
              <TableHeaderCell>Invoice</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell align="end">Amount</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {state === "loading" ? (
              <TableLoadingRows rows={4} cols={3} />
            ) : state === "error" ? (
              <TableState
                kind="error"
                colSpan={3}
                count="!"
                title="Invoices didn't load"
                body="Accounting's server didn't answer. Nothing changed; try again."
                action={<Button onClick={load}>Retry</Button>}
              />
            ) : (
              INVOICES.map(([id, client, amount]) => (
                <TableRow key={id}>
                  <TableCell className="font-kl-mono text-[13px]">{id}</TableCell>
                  <TableCell>{client}</TableCell>
                  <TableCell align="end" className="tabular-nums">
                    {amount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableScroll>
      <TablePagination page={0} pageSize={10} total={state === "ready" ? INVOICES.length : null} onPageChange={() => {}} noun="invoices" />
    </TableFrame>
  )
}

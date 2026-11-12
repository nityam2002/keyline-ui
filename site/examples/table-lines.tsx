"use client";

import { Fragment, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableDetail,
  TableExpandCell,
  TableFrame,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableScroll,
} from "@/components/keyline/ui/table";

const ORDERS = [
  {
    id: "DM-4107",
    client: "Lackawanna County",
    total: "$9,610.00",
    lines: [
      ["Copy paper, letter, 20 lb", "100 cases", "$7,400.00"],
      ["Cardstock, white, 110 lb", "20 cases", "$2,210.00"],
    ],
  },
  {
    id: "DM-4115",
    client: "Blue Cross of Pennsylvania",
    total: "$4,980.00",
    lines: [
      ["Copy paper, legal, 20 lb", "50 cases", "$4,150.00"],
      ["Envelopes, #10, security tint", "10 boxes", "$830.00"],
    ],
  },
  {
    id: "DM-4120",
    client: "Scranton White Pages",
    total: "$740.00",
    lines: [["Copy paper, letter, 20 lb", "10 cases", "$740.00"]],
  },
];

export function OrderLines() {
  const [open, setOpen] = useState<Set<string>>(new Set(["DM-4107"]));
  const toggle = (id: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <TableFrame>
      <TableScroll>
        <Table aria-label="Orders with their lines">
          <TableHead>
            <tr>
              <TableExpandCell header label="Show lines" />
              <TableHeaderCell>Order</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell align="end">Total</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {ORDERS.map((o) => (
              <Fragment key={o.id}>
                <TableRow expanded={open.has(o.id)}>
                  <TableExpandCell expanded={open.has(o.id)} onToggle={() => toggle(o.id)} label={`Lines in ${o.id}`} />
                  <TableCell className="font-kl-mono text-[13px]">{o.id}</TableCell>
                  <TableCell>{o.client}</TableCell>
                  <TableCell align="end" className="tabular-nums">
                    {o.total}
                  </TableCell>
                </TableRow>
                <TableDetail open={open.has(o.id)} colSpan={4}>
                  <dl className="m-0 grid grid-cols-[1fr_auto_auto] gap-x-6 gap-y-1 px-3 py-3 text-[14px]">
                    {o.lines.map(([item, qty, amount]) => (
                      <div key={item} className="contents">
                        <dt>{item}</dt>
                        <dd className="m-0 text-kl-ink-2 tabular-nums">{qty}</dd>
                        <dd className="m-0 text-end tabular-nums">{amount}</dd>
                      </div>
                    ))}
                  </dl>
                </TableDetail>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </TableFrame>
  );
}

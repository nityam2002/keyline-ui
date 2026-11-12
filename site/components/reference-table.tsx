"use client";

import * as React from "react";
import {
  TableFrame,
  TableScroll,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/keyline/ui/table";

export type ReferenceRow = { name: React.ReactNode; value: React.ReactNode; description: React.ReactNode };

// The guides' tables (tokens, roles, modes) in the same Keyline Table as the props reference: code columns in
// the Code voice, prose wrapping. On a phone each row becomes a block, the name and value over the description.
const CELL = "h-auto py-3 align-top whitespace-normal max-[721px]:border-0 max-[721px]:py-1";
const CODE = "[&_code]:bg-transparent [&_code]:p-0 [&_code]:font-kl-mono";

/** A three-column reference: a name, its value (both usually code) and what it is for. */
export function ReferenceTable({
  label,
  head,
  rows,
}: {
  label: string;
  head: [string, string, string];
  rows: ReferenceRow[];
}) {
  return (
    <div className="mt-4 [&+.s-small]:mb-16">
      <TableFrame aria-label={label}>
        <TableScroll>
          <Table className="max-[721px]:w-full">
            <TableHead className="max-[721px]:hidden">
              <tr>
                {head.map((h) => (
                  <TableHeaderCell key={h}>{h}</TableHeaderCell>
                ))}
              </tr>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow
                  key={i}
                  className="max-[721px]:grid max-[721px]:grid-cols-1 max-[721px]:border-b max-[721px]:border-kl-seam max-[721px]:last:border-b-0"
                >
                  <TableCell
                    className={`${CELL} ${CODE} text-[14px] font-medium text-kl-ink max-[721px]:pt-3 [&_code]:whitespace-nowrap`}
                  >
                    {r.name}
                  </TableCell>
                  <TableCell className={`${CELL} ${CODE} text-[13px] text-kl-ink-2`}>{r.value}</TableCell>
                  <TableCell
                    className={`${CELL} min-w-60 text-[14px]/[1.55] text-kl-ink-2 max-[721px]:min-w-0 max-[721px]:pb-3 [&_code]:bg-kl-paper [&_code]:px-1 [&_code]:py-0 [&_code]:text-[12.5px] [&_code]:text-kl-ink`}
                  >
                    {r.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      </TableFrame>
    </div>
  );
}

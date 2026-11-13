"use client";

import * as React from "react";
import {
  TableFrame,
  TableScroll,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/keyline/ui/table";
import { inlineCode } from "@site/lib/inline-code";

/** A union wraps between members, never inside one: `"horizontal" |` then `"vertical"`. The bars are quieter than
 *  the members, so the eye reads the values, not the punctuation. */
function unionParts(type: string) {
  const parts = type.split(" | ");
  return parts.map((t, i) => (
    <React.Fragment key={i}>
      <span className="whitespace-nowrap">
        {t}
        {i < parts.length - 1 ? <span className="text-kl-ink-3"> |</span> : null}
      </span>
      {i < parts.length - 1 ? " " : null}
    </React.Fragment>
  ));
}

export type Prop = {
  name: string;
  /** the type as written in TypeScript, e.g. "scroll" | "menu" */
  type: string;
  default: string;
  description: React.ReactNode;
};

// Every cell: top-aligned and wrapping (a description runs to several lines). On a phone each prop becomes an
// entry read in the order a reader asks: the name, what it does, then the type and default as a small spec set
// against a fixed label column, so the values line up from prop to prop. The entry carries its own padding and
// only the seam between props; a default of "—" says nothing, so its line is dropped.
const CELL =
  "h-auto py-3 align-top whitespace-normal max-[721px]:block max-[721px]:h-auto max-[721px]:border-0! max-[721px]:py-0";
const CODE = "bg-transparent p-0 font-kl-mono";
const SPEC = "max-[721px]:flex max-[721px]:items-baseline max-[721px]:gap-3 max-[721px]:pt-0.5";
const LABEL = "hidden w-14 shrink-0 text-[12px] text-kl-ink-3 max-[721px]:inline";

/** Props set in Keyline's own Table: one row per prop, the code columns in the Code voice. */
export function PropsReference({ label, props }: { label: string; props: Prop[] }) {
  return (
    <div className="mt-4 [&+.s-small]:mb-16">
      <TableFrame aria-label={label}>
        <TableScroll>
          <Table className="max-[721px]:w-full">
            <TableHeader className="max-[721px]:hidden">
              <tr>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {props.map((p) => (
                <TableRow
                  key={p.name}
                  id={`prop-${p.name}`}
                  className="max-[721px]:flex max-[721px]:flex-col max-[721px]:border-b max-[721px]:border-kl-seam max-[721px]:pt-3.5 max-[721px]:pb-4 max-[721px]:last:border-b-0"
                >
                  <TableCell className={CELL}>
                    <code
                      className={`${CODE} text-[14px] font-medium whitespace-nowrap text-kl-ink max-[721px]:text-[15px] max-[721px]:whitespace-normal`}
                    >
                      {p.name}
                    </code>
                  </TableCell>
                  <TableCell className={`${CELL} ${SPEC} max-[721px]:order-2`}>
                    <span className={LABEL}>Type</span>
                    <code className={`${CODE} min-w-0 text-[13px]/[1.6] text-kl-ink-2`}>{unionParts(p.type)}</code>
                  </TableCell>
                  <TableCell
                    className={`${CELL} ${SPEC} max-[721px]:order-3 ${p.default === "—" ? "max-[721px]:hidden" : ""}`}
                  >
                    <span className={LABEL}>Default</span>
                    <code className={`${CODE} text-[13px] whitespace-nowrap text-kl-ink-2`}>{p.default}</code>
                  </TableCell>
                  <TableCell
                    className={`${CELL} min-w-60 text-[14px]/[1.55] text-kl-ink-2 max-[721px]:order-1 max-[721px]:min-w-0 max-[721px]:pt-1 max-[721px]:pb-2 [&_code]:bg-kl-paper [&_code]:px-1 [&_code]:py-0 [&_code]:text-[12.5px] [&_code]:text-kl-ink ${p.description === "—" ? "max-[721px]:hidden" : ""}`}
                  >
                    {inlineCode(p.description)}
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

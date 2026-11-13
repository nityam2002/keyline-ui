import "./render-count";

import * as React from "react";
import {
  Table,
  TableBody,
  TableBulkBar,
  TableCaption,
  TableCell,
  TableFrame,
  TableHead,
  TableHeader,
  TableIndexCell,
  TablePager,
  TablePagination,
  TableRow,
  TableScroll,
  TableSortHeader,
  TableToolbar,
} from "@/components/keyline/ui/table";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";
import { describeConformance } from "./conformance";

// each part in the smallest table that holds it, so the DOM stays valid
const inTable = (part: React.ReactNode) => <table>{part}</table>;
const inBody = (part: React.ReactNode) => (
  <table>
    <tbody>{part}</tbody>
  </table>
);
const inRow = (part: React.ReactNode) => (
  <table>
    <tbody>
      <tr>{part}</tr>
    </tbody>
  </table>
);
const inHeaderRow = (part: React.ReactNode) => (
  <table>
    <thead>
      <tr>{part}</tr>
    </thead>
  </table>
);

describeConformance("table", {
  TableFrame: { element: <TableFrame />, refInstanceof: HTMLElement, slot: "table-frame" },
  TableToolbar: { element: <TableToolbar />, refInstanceof: HTMLDivElement, slot: "table-toolbar" },
  TableBulkBar: { element: <TableBulkBar count={2} />, refInstanceof: HTMLDivElement, slot: "table-bulk-bar" },
  Table: { element: <Table />, refInstanceof: HTMLTableElement, slot: "table" },
  TableCaption: {
    element: <TableCaption>Shipments</TableCaption>,
    refInstanceof: HTMLTableCaptionElement,
    slot: "table-caption",
    wrap: inTable,
  },
  TableHeader: {
    element: <TableHeader />,
    refInstanceof: HTMLTableSectionElement,
    slot: "table-header",
    wrap: inTable,
  },
  TableBody: { element: <TableBody />, refInstanceof: HTMLTableSectionElement, slot: "table-body", wrap: inTable },
  TableRow: { element: <TableRow />, refInstanceof: HTMLTableRowElement, slot: "table-row", wrap: inBody },
  TableHead: {
    element: <TableHead>Carrier</TableHead>,
    refInstanceof: HTMLTableCellElement,
    slot: "table-head",
    wrap: inHeaderRow,
  },
  TableSortHeader: {
    element: (
      <TableSortHeader sort={null} onSort={() => {}}>
        ETA
      </TableSortHeader>
    ),
    refInstanceof: HTMLTableCellElement,
    slot: "table-sort-header",
    wrap: inHeaderRow,
  },
  TableCell: {
    element: <TableCell>DHL</TableCell>,
    refInstanceof: HTMLTableCellElement,
    slot: "table-cell",
    wrap: inRow,
  },
  TablePager: { element: <TablePager />, refInstanceof: HTMLDivElement, slot: "table-pager" },
});

const ROWS = [
  { id: "SH-20481", carrier: "DHL", weight: "12.4" },
  { id: "SH-20482", carrier: "UPS", weight: "3.1" },
  { id: "SH-20483", carrier: "FedEx", weight: "48.0" },
];

function Shipments() {
  return (
    <TableFrame>
      <TableBulkBar count={1} scope="1 of 3 on this page" />
      <TableScroll>
        <Table>
          <TableCaption>Shipments</TableCaption>
          <TableHeader>
            <TableRow>
              <TableIndexCell header checked={false} indeterminate onCheckedChange={() => {}} label="Select page" />
              <TableSortHeader sort="ascending" priority={1} levels={2} onSort={() => {}}>
                Shipment
              </TableSortHeader>
              <TableSortHeader sort="descending" priority={2} levels={2} onSort={() => {}}>
                Carrier
              </TableSortHeader>
              <TableHead align="end">Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((r, i) => (
              <TableRow key={r.id} selected={i === 0} aria-selected={i === 0}>
                <TableIndexCell
                  checked={i === 0}
                  onCheckedChange={() => {}}
                  code={`0${i + 1}`}
                  label={`Select ${r.id}`}
                />
                <TableCell render={<th scope="row" />}>{r.id}</TableCell>
                <TableCell>{r.carrier}</TableCell>
                <TableCell align="end">{r.weight}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScroll>
      <TablePagination page={0} pageSize={10} total={3} onPageChange={() => {}} noun="shipments" />
    </TableFrame>
  );
}

describe("table: axe", () => {
  it("has no violations: caption, multi-sort headers, a selected row, the bulk bar and the pager", async () => {
    await render(
      <main>
        <Shipments />
      </main>,
    );
    await expectNoAxeViolations();
  });
});

describe("table: documented attributes", () => {
  it("rows carry data-selected and data-expanded; sort headers carry data-sort, aria-sort and the ordinal", async () => {
    await render(
      <main>
        <Shipments />
        <table>
          <tbody>
            <TableRow data-testid="expanded" expanded>
              <TableCell>open</TableCell>
            </TableRow>
          </tbody>
        </table>
      </main>,
    );
    const rows = document.querySelectorAll<HTMLElement>("tbody [data-slot=table-row]");
    expect(rows[0]!.hasAttribute("data-selected")).toBe(true);
    expect(rows[1]!.hasAttribute("data-selected")).toBe(false);
    expect(document.querySelector("[data-testid=expanded]")!.hasAttribute("data-expanded")).toBe(true);

    const [first, second] = document.querySelectorAll<HTMLElement>("[data-slot=table-sort-header]");
    expect(first!.dataset["sort"]).toBe("ascending");
    expect(first!.getAttribute("aria-sort")).toBe("ascending");
    // ARIA allows aria-sort on one header: later levels say their place in text instead
    expect(second!.dataset["sort"]).toBe("descending");
    expect(second!.hasAttribute("aria-sort")).toBe(false);
    expect(second!.querySelector("button")!.textContent).toContain("sort 2 of 2, descending");
    expect(document.querySelector("[data-slot=table-head]")!.getAttribute("data-align")).toBe("end");

    const bar = document.querySelector<HTMLElement>("[data-slot=table-bulk-bar]")!;
    expect(bar.getAttribute("aria-live")).toBe("polite");
    expect(bar.hasAttribute("data-empty")).toBe(false);
  });

  it("the bulk bar is marked empty at 0, and its className function gets the count", async () => {
    let received: unknown;
    await render(
      <main>
        <TableBulkBar
          count={0}
          className={(state) => {
            received = state;
            return undefined;
          }}
        />
      </main>,
    );
    expect(document.querySelector("[data-slot=table-bulk-bar]")!.hasAttribute("data-empty")).toBe(true);
    expect(received).toEqual({ count: 0 });
  });
});

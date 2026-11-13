import { countRenders } from "./render-count";

import * as React from "react";
import {
  DataTable,
  DataTableBulkBar,
  DataTablePagination,
  DataTableSearch,
  useDataTable,
  type DataTableColumnDef,
  type DataTableState,
} from "@/components/keyline/ui/data-table";
import { TableFrame, TableScroll, TableToolbar } from "@/components/keyline/ui/table";
import { render } from "vitest-browser-react";
import { server, userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { expectNoAxeViolations } from "./axe";

const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}";
const SHIFT_TAB = server.browser === "webkit" ? "{Alt>}{Shift>}{Tab}{/Shift}{/Alt}" : "{Shift>}{Tab}{/Shift}";

type Shipment = { id: string; carrier: string; weight: number };

const CARRIERS = ["DHL", "UPS", "FedEx", "USPS"];
const SHIPMENTS: Shipment[] = Array.from({ length: 25 }, (_, i) => ({
  id: `SH-${20481 + i}`,
  carrier: CARRIERS[(i * 7) % CARRIERS.length]!,
  weight: ((i * 37) % 50) + 0.5,
}));

const COLUMNS: DataTableColumnDef<Shipment>[] = [
  { accessorKey: "id", header: "Shipment" },
  { accessorKey: "carrier", header: "Carrier" },
  {
    accessorKey: "weight",
    header: "Weight",
    sortDescFirst: true,
    meta: { align: "end" },
    cell: ({ getValue }) => `${(getValue() as number).toFixed(1)} kg`,
  },
];

function Shipments({
  data = SHIPMENTS,
  state,
  onStateChange,
  defaultState,
}: {
  data?: Shipment[];
  state?: Partial<DataTableState>;
  onStateChange?: (state: DataTableState, details: { slice: keyof DataTableState }) => void;
  defaultState?: Partial<DataTableState>;
}) {
  const table = useDataTable({ data, columns: COLUMNS, state, onStateChange, defaultState });
  return (
    <TableFrame>
      <TableToolbar>
        <DataTableSearch table={table} placeholder="Search shipments" />
      </TableToolbar>
      <DataTableBulkBar table={table} scope={(count) => `${count} on this page`} />
      <TableScroll>
        <DataTable
          table={table}
          caption="Shipments"
          rowLabel={(row) => `Select ${row.original.id}`}
          empty={{ title: "No shipments match" }}
        />
      </TableScroll>
      <DataTablePagination table={table} noun="shipments" />
    </TableFrame>
  );
}

const bodyRows = () => [...document.querySelectorAll<HTMLElement>("tbody [data-slot=table-row]")];
const firstColumn = () => bodyRows().map((r) => r.querySelector("[data-slot=table-cell]")!.textContent);
const header = (name: string) =>
  [...document.querySelectorAll<HTMLElement>("[data-slot=table-sort-header]")].find((h) =>
    h.querySelector("button")!.textContent!.startsWith(name),
  )!;
const checkbox = (name: string) => document.querySelector<HTMLElement>(`[role=checkbox][aria-label="${name}"]`)!;
const bulkBar = () => document.querySelector<HTMLElement>("[data-slot=table-bulk-bar]")!;

// a store update renders after the event; wait for the next frame before reading the DOM
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

describe("data-table: axe", () => {
  it("has no violations: unsorted, then multi-sorted with a row selected", async () => {
    await render(
      <main>
        <Shipments />
      </main>,
    );
    await expectNoAxeViolations();
    await userEvent.click(header("Carrier").querySelector("button")!);
    await userEvent.click(header("Shipment").querySelector("button")!, { modifiers: ["Shift"] } as never);
    await userEvent.click(checkbox("Select SH-20481"));
    await expectNoAxeViolations();
  });
});

describe("data-table: render counts", () => {
  it("toggling one row renders exactly that row", async () => {
    await render(
      <main>
        <Shipments />
      </main>,
    );
    const renders = countRenders();
    await userEvent.click(checkbox("Select SH-20483"));
    await frame();
    expect(checkbox("Select SH-20483").getAttribute("aria-checked")).toBe("true");
    expect(renders.count("TableRow")).toBe(1);
    // the owner, the body and the other rows stay put
    expect(renders.count("Shipments")).toBe(0);
    expect(renders.count("DataTable")).toBe(0);
    expect(renders.count("TableBody")).toBe(0);
    expect(renders.count("DataTableRow")).toBe(0);

    renders.reset();
    await userEvent.click(checkbox("Select SH-20483"));
    await frame();
    expect(checkbox("Select SH-20483").getAttribute("aria-checked")).toBe("false");
    expect(renders.count("TableRow")).toBe(1);
  });

  it("sorting renders the body once", async () => {
    await render(
      <main>
        <Shipments />
      </main>,
    );
    const renders = countRenders();
    await userEvent.click(header("Carrier").querySelector("button")!);
    await frame();
    expect(header("Carrier").getAttribute("aria-sort")).toBe("ascending");
    expect(renders.count("TableBody")).toBe(1);
    expect(renders.count("DataTable")).toBe(1);
  });
});

describe("data-table: sorting", () => {
  it("cycles ascending, descending, none; a sortDescFirst column starts descending", async () => {
    await render(
      <main>
        <Shipments />
      </main>,
    );
    const button = header("Shipment").querySelector("button")!;
    expect(header("Shipment").getAttribute("aria-sort")).toBe("none");
    await userEvent.click(button);
    expect(header("Shipment").getAttribute("aria-sort")).toBe("ascending");
    expect(firstColumn()[0]).toBe("SH-20481");
    await userEvent.click(button);
    expect(header("Shipment").getAttribute("aria-sort")).toBe("descending");
    expect(firstColumn()[0]).toBe("SH-20505");
    await userEvent.click(button);
    expect(header("Shipment").getAttribute("aria-sort")).toBe("none");

    await userEvent.click(header("Weight").querySelector("button")!);
    expect(header("Weight").getAttribute("aria-sort")).toBe("descending");
  });

  it("Shift adds a level: the first level carries aria-sort, the second says its place", async () => {
    await render(
      <main>
        <Shipments />
      </main>,
    );
    await userEvent.click(header("Carrier").querySelector("button")!);
    await userEvent.click(header("Weight").querySelector("button")!, { modifiers: ["Shift"] } as never);
    expect(header("Carrier").getAttribute("aria-sort")).toBe("ascending");
    expect(header("Weight").hasAttribute("aria-sort")).toBe(false);
    expect(header("Weight").dataset["sort"]).toBe("descending");
    expect(header("Weight").querySelector("button")!.textContent).toContain("sort 2 of 2, descending");
  });
});

describe("data-table: keyboard", () => {
  it("Tab enters the table and leaves it", async () => {
    await render(
      <main>
        <button type="button">Before</button>
        <Shipments data={SHIPMENTS.slice(0, 2)} />
        <button type="button">After</button>
      </main>,
    );
    const before = document.querySelector<HTMLButtonElement>("main > button")!;
    const after = document.querySelector<HTMLButtonElement>("main > button:last-of-type")!;
    before.focus();
    await userEvent.keyboard(TAB);
    // the toolbar's search, then the table
    expect(document.activeElement).toBe(document.querySelector("[data-slot=table-search] input"));
    await userEvent.keyboard(TAB);
    expect(document.activeElement).toBe(checkbox("Select this page"));
    const stops = [
      header("Shipment").querySelector("button"),
      header("Carrier").querySelector("button"),
      header("Weight").querySelector("button"),
      checkbox("Select SH-20481"),
      checkbox("Select SH-20482"),
    ];
    for (const stop of stops) {
      await userEvent.keyboard(TAB);
      expect(document.activeElement).toBe(stop);
    }
    // the pager's buttons are disabled on a single page, so the next stop is past the table
    await userEvent.keyboard(TAB);
    expect(document.activeElement).toBe(after);
    await userEvent.keyboard(SHIFT_TAB);
    expect(document.activeElement).toBe(checkbox("Select SH-20482"));
  });

  it("sort headers respond to Enter and Space", async () => {
    await render(
      <main>
        <Shipments />
      </main>,
    );
    header("Carrier").querySelector("button")!.focus();
    await userEvent.keyboard("{Enter}");
    expect(header("Carrier").getAttribute("aria-sort")).toBe("ascending");
    await userEvent.keyboard(" ");
    expect(header("Carrier").getAttribute("aria-sort")).toBe("descending");
    expect(document.activeElement).toBe(header("Carrier").querySelector("button"));
  });
});

describe("data-table: selection", () => {
  it("rows carry aria-selected; the bulk bar counts politely; select-all takes the page; Shift takes a range", async () => {
    await render(
      <main>
        <Shipments />
      </main>,
    );
    expect(bulkBar().getAttribute("aria-live")).toBe("polite");
    expect(bulkBar().hasAttribute("data-empty")).toBe(true);
    expect(bodyRows()[0]!.getAttribute("aria-selected")).toBe("false");

    await userEvent.click(checkbox("Select SH-20481"));
    expect(bodyRows()[0]!.getAttribute("aria-selected")).toBe("true");
    expect(bodyRows()[0]!.hasAttribute("data-selected")).toBe(true);
    expect(bulkBar().querySelector(".kl-count")!.textContent).toBe("1");
    expect(bulkBar().hasAttribute("data-empty")).toBe(false);
    expect(checkbox("Select this page").getAttribute("aria-checked")).toBe("mixed");

    await userEvent.click(checkbox("Select SH-20484"), { modifiers: ["Shift"] } as never);
    expect(
      bodyRows()
        .map((r) => r.getAttribute("aria-selected"))
        .slice(0, 5),
    ).toEqual(["true", "true", "true", "true", "false"]);
    expect(bulkBar().querySelector(".kl-count")!.textContent).toBe("4");

    await userEvent.click(checkbox("Select this page"));
    expect(bulkBar().querySelector(".kl-count")!.textContent).toBe("10");
    expect(bulkBar().textContent).toContain("10 on this page");
    expect(checkbox("Select this page").getAttribute("aria-checked")).toBe("true");
  });
});

describe("data-table: paging and search", () => {
  it("pages through the rows; the search filters every column and returns to page 1", async () => {
    await render(
      <main>
        <Shipments />
      </main>,
    );
    const range = () => document.querySelector("[data-slot=table-range]")!.textContent!.replace(/\u00a0/g, " ");
    expect(range()).toBe("1–10 of 25 shipments");
    expect(bodyRows()).toHaveLength(10);
    await userEvent.click(document.querySelector<HTMLElement>("[aria-label='Next page']")!);
    expect(range()).toBe("11–20 of 25 shipments");
    expect(firstColumn()[0]).toBe("SH-20491");
    expect(bodyRows()[0]!.querySelector("[data-slot=table-index-cell]")!.textContent).toBe("11");

    await userEvent.type(document.querySelector<HTMLElement>("[data-slot=table-search] input")!, "fedex");
    const expected = SHIPMENTS.filter((s) => s.carrier === "FedEx").length;
    expect(range()).toBe(`1–${Math.min(10, expected)} of ${expected} shipments`);

    await userEvent.fill(document.querySelector<HTMLElement>("[data-slot=table-search] input")!, "nothing like this");
    expect(document.querySelector("[data-slot=table-state]")!.textContent).toContain("No shipments match");
  });
});

describe("data-table: controlled state", () => {
  it("a controlled slice follows the caller; every change is reported with its slice", async () => {
    const reports: Array<{ slice: string; sorting: unknown; rowSelection: unknown }> = [];
    function Controlled() {
      const [sorting, setSorting] = React.useState<DataTableState["sorting"]>([{ id: "carrier", desc: true }]);
      return (
        <Shipments
          state={{ sorting }}
          onStateChange={(next, { slice }) => {
            reports.push({ slice, sorting: next.sorting, rowSelection: next.rowSelection });
            // the caller decides: it keeps the change only for carrier
            if (slice === "sorting") setSorting(next.sorting.filter((s) => s.id === "carrier"));
          }}
        />
      );
    }
    await render(
      <main>
        <Controlled />
      </main>,
    );
    expect(header("Carrier").getAttribute("aria-sort")).toBe("descending");

    await userEvent.click(header("Carrier").querySelector("button")!);
    expect(reports.at(-1)).toEqual({ slice: "sorting", sorting: [], rowSelection: {} });
    expect(header("Carrier").getAttribute("aria-sort")).toBe("none");

    // the caller refuses a sort by weight: the table keeps the caller's value
    await userEvent.click(header("Weight").querySelector("button")!);
    expect(reports.at(-1)!.sorting).toEqual([{ id: "weight", desc: true }]);
    expect(header("Weight").getAttribute("aria-sort")).toBe("none");

    // an uncontrolled slice is the table's own, and still reported
    await userEvent.click(checkbox("Select SH-20481"));
    expect(reports.at(-1)).toEqual({ slice: "rowSelection", sorting: [], rowSelection: { "SH-20481": true } });
    expect(bodyRows()[0]!.getAttribute("aria-selected")).toBe("true");
  });

  it("defaultState seeds the table's own slices", async () => {
    await render(
      <main>
        <Shipments defaultState={{ pagination: { pageIndex: 0, pageSize: 5 }, sorting: [{ id: "id", desc: true }] }} />
      </main>,
    );
    expect(bodyRows()).toHaveLength(5);
    expect(firstColumn()[0]).toBe("SH-20505");
    expect(header("Shipment").getAttribute("aria-sort")).toBe("descending");
  });
});

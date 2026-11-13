import type { KeylineItem } from "../../item";

export default {
  name: "data-table",
  type: "registry:ui",
  title: "Data Table",
  description:
    "TanStack Table driving the Keyline table parts: useDataTable (sorting, multi-sort, filters, a search, paging, row selection, column visibility; each slice controlled or not) and DataTable, DataTableBulkBar, DataTablePagination and DataTableSearch. Selecting a row re-renders that row alone.",
  whenToUse:
    "Use it when rows need sorting, filtering, paging and selection worked out for you, on TanStack Table. For a table whose data and state you manage yourself use Table.",
  files: [{ path: "src/registry/keyline/ui/data-table.tsx", type: "registry:ui" }],
  dependencies: ["@tanstack/react-table"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "@keyline-ui/table",
    "@keyline-ui/data-table-model",
    "@keyline-ui/keyline-render",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

import type { KeylineItem } from "../../item";

export default {
  name: "data-table",
  type: "registry:ui",
  title: "Data Table",
  description:
    "TanStack Table driving the Keyline table parts: useDataTable (sorting, multi-sort, filters, a search, paging, row selection, column visibility; each slice controlled or not) and DataTable, DataTableBulkBar, DataTablePagination and DataTableSearch. Selecting a row re-renders that row alone.",
  files: [{ path: "src/registry/keyline/ui/data-table.tsx", type: "registry:ui" }],
  dependencies: ["@tanstack/react-table"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "@keyline-ui/table",
    "@keyline-ui/data-table-model",
    "@keyline-ui/keyline-render",
  ],
} satisfies KeylineItem;

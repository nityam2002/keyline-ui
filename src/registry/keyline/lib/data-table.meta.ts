import type { KeylineItem } from "../../item";

export default {
  name: "data-table-model",
  type: "registry:lib",
  title: "Data table model",
  description:
    "Pure helpers behind the Data Table: the sort cycle and multi-sort ordinal of a column, aria-sort, a column's alignment, the pager's range, and the filter model (text, set and range filters, a search, and the filter's words for a token).",
  files: [{ path: "src/registry/keyline/lib/data-table.ts", type: "registry:lib" }],
  registryDependencies: ["@keyline-ui/collection"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

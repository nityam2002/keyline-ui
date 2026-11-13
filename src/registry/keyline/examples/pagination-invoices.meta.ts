import type { KeylineItem } from "../../item";

export default {
  name: "pagination-invoices",
  type: "registry:block",
  title: "Pagination: invoice archive",
  description: "An example of Pagination: invoice archive.",
  categories: ["pagination"],
  files: [{ path: "src/registry/keyline/examples/pagination-invoices.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/pagination"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

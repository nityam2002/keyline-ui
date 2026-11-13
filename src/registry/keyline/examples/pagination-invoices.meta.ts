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
} satisfies KeylineItem;

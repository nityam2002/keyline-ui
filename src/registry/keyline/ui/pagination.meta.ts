import type { KeylineItem } from "../../item";

export default {
  name: "pagination",
  type: "registry:ui",
  title: "Pagination",
  description:
    'Page numbers as cells with a cobalt current page; constant width while paging; folds to "5 / 20" when narrow; buttons or links.',
  files: [{ path: "src/registry/keyline/ui/pagination.tsx", type: "registry:ui" }],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/collection"],
} satisfies KeylineItem;

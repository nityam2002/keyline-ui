import type { KeylineItem } from "../../item";

export default {
  name: "progress-print",
  type: "registry:block",
  title: "Progress: print invoices",
  description: "An example of Progress: print invoices.",
  categories: ["progress"],
  files: [{ path: "src/registry/keyline/examples/progress-print.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/progress"],
} satisfies KeylineItem;

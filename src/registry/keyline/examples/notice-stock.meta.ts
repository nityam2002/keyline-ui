import type { KeylineItem } from "../../item";

export default {
  name: "notice-stock",
  type: "registry:block",
  title: "Notice: paper stock",
  description: "An example of Notice: paper stock.",
  categories: ["notice"],
  files: [{ path: "src/registry/keyline/examples/notice-stock.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/notice"],
} satisfies KeylineItem;

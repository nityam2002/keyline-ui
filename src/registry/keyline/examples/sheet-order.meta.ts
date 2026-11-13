import type { KeylineItem } from "../../item";

export default {
  name: "sheet-order",
  type: "registry:block",
  title: "Sheet: order sheet",
  description: "An example of Sheet: order sheet.",
  categories: ["sheet"],
  files: [{ path: "src/registry/keyline/examples/sheet-order.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/sheet", "@keyline-ui/status"],
} satisfies KeylineItem;

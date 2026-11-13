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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

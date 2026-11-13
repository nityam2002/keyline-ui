import type { KeylineItem } from "../../item";

export default {
  name: "native-select-transfer",
  type: "registry:block",
  title: "Native select: transfer request",
  description: "An example of Native select: transfer request.",
  categories: ["native-select"],
  files: [{ path: "src/registry/keyline/examples/native-select-transfer.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/field", "@keyline-ui/keyline", "@keyline-ui/native-select"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

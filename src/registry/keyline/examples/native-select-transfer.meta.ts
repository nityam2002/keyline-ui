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
} satisfies KeylineItem;

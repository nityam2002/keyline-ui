import type { KeylineItem } from "../../item";

export default {
  name: "progress-upload",
  type: "registry:block",
  title: "Progress: upload report",
  description: "An example of Progress: upload report.",
  categories: ["progress"],
  files: [{ path: "src/registry/keyline/examples/progress-upload.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/progress"],
} satisfies KeylineItem;

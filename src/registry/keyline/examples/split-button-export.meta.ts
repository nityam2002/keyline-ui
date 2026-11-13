import type { KeylineItem } from "../../item";

export default {
  name: "split-button-export",
  type: "registry:block",
  title: "Split button: export report",
  description: "An example of Split button: export report.",
  categories: ["split-button"],
  files: [{ path: "src/registry/keyline/examples/split-button-export.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/menu", "@keyline-ui/split-button"],
} satisfies KeylineItem;

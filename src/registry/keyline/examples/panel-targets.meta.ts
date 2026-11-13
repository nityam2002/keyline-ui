import type { KeylineItem } from "../../item";

export default {
  name: "panel-targets",
  type: "registry:block",
  title: "Panel: sales targets",
  description: "An example of Panel: sales targets.",
  categories: ["panel"],
  files: [{ path: "src/registry/keyline/examples/panel-targets.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/panel", "@keyline-ui/stat"],
} satisfies KeylineItem;

import type { KeylineItem } from "../../item";

export default {
  name: "segmented-period",
  type: "registry:block",
  title: "Segmented control: sales by period",
  description: "An example of Segmented control: sales by period.",
  categories: ["segmented"],
  files: [{ path: "src/registry/keyline/examples/segmented-period.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/segmented"],
} satisfies KeylineItem;

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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

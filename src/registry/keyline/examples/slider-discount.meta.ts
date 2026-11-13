import type { KeylineItem } from "../../item";

export default {
  name: "slider-discount",
  type: "registry:block",
  title: "Slider: county discount",
  description: "An example of Slider: county discount.",
  categories: ["slider"],
  files: [{ path: "src/registry/keyline/examples/slider-discount.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/slider"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

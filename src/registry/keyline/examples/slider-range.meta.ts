import type { KeylineItem } from "../../item";

export default {
  name: "slider-range",
  type: "registry:block",
  title: "Slider: price range",
  description: "An example of Slider: price range.",
  categories: ["slider"],
  files: [{ path: "src/registry/keyline/examples/slider-range.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/slider"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

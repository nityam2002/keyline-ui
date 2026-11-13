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
} satisfies KeylineItem;

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
} satisfies KeylineItem;

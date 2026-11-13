import type { KeylineItem } from "../../item";

export default {
  name: "split-button-delivery",
  type: "registry:block",
  title: "Split button: book delivery",
  description: "An example of Split button: book delivery.",
  categories: ["split-button"],
  files: [{ path: "src/registry/keyline/examples/split-button-delivery.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/menu", "@keyline-ui/split-button"],
} satisfies KeylineItem;

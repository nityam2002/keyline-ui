import type { KeylineItem } from "../../item";

export default {
  name: "combobox-directory",
  type: "registry:block",
  title: "Combobox: corporate directory",
  description: "An example of Combobox: corporate directory.",
  categories: ["combobox"],
  files: [{ path: "src/registry/keyline/examples/combobox-directory.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/combobox", "@keyline-ui/keyline"],
} satisfies KeylineItem;

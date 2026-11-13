import type { KeylineItem } from "../../item";

export default {
  name: "combobox-client",
  type: "registry:block",
  title: "Combobox: find client",
  description: "An example of Combobox: find client.",
  categories: ["combobox"],
  files: [{ path: "src/registry/keyline/examples/combobox-client.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/combobox", "@keyline-ui/keyline"],
} satisfies KeylineItem;

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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

import type { KeylineItem } from "../../item";

export default {
  name: "multiselect",
  type: "registry:ui",
  title: "Multiselect",
  description: "Searchable async multiselect: tokens are cells in the field frame, the list docks to it.",
  files: [{ path: "src/registry/keyline/ui/multiselect.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/multiselect.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope", "@keyline-ui/field"],
} satisfies KeylineItem;

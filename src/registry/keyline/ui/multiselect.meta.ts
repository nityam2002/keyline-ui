import type { KeylineItem } from "../../item";

export default {
  name: "multiselect",
  type: "registry:ui",
  title: "Multiselect",
  description:
    "Searchable async multiselect, a preset over Combobox's parts with Base UI's multiple: chips are cells in the field frame, the list docks to it.",
  files: [{ path: "src/registry/keyline/ui/multiselect.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/combobox"],
} satisfies KeylineItem;

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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

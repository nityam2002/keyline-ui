import type { KeylineItem } from "../../item";

export default {
  name: "field",
  type: "registry:ui",
  title: "Field",
  description:
    "Field, input, affix cells, field group and validation with an inserted attention cell. Form (Base UI Form) and vertical, horizontal or responsive field orientation.",
  files: [{ path: "src/registry/keyline/ui/field.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

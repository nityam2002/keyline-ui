import type { KeylineItem } from "../../item";

export default {
  name: "field",
  type: "registry:ui",
  title: "Field",
  description:
    "Field, input, affix cells, field group and validation with an inserted attention cell. Form (Base UI Form) and vertical, horizontal or responsive field orientation.",
  whenToUse:
    "Use it to give any input a label, description and error, and Form to line fields up. Reach for it around every text input in a form.",
  files: [{ path: "src/registry/keyline/ui/field.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;

import type { KeylineItem } from "../../item";

export default {
  name: "field",
  type: "registry:ui",
  title: "Field",
  description:
    "Field, input, affix cells, field group and validation with an inserted attention cell. Form (Base UI Form) and vertical, horizontal or responsive field orientation.",
  files: [{ path: "src/registry/keyline/ui/field.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/field.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;

import type { KeylineItem } from "../../item";

export default {
  name: "checkbox-group",
  type: "registry:ui",
  title: "Checkbox group",
  description:
    "Several independent choices to one question in one frame (Base UI CheckboxGroup): an optional parent row that checks or clears all with a count, rows with description and meta, Form participant.",
  files: [{ path: "src/registry/keyline/ui/checkbox-group.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/checkbox",
    "@keyline-ui/field",
    "@keyline-ui/keyline-render",
  ],
} satisfies KeylineItem;

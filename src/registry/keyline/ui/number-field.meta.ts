import type { KeylineItem } from "../../item";

export default {
  name: "number-field",
  type: "registry:ui",
  title: "Number field",
  description:
    "A number in a field frame with stepper key cells and a unit cell: Base UI NumberField (locale parsing, hold-to-repeat, min/max) inside a Field.",
  files: [{ path: "src/registry/keyline/ui/number-field.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render", "@keyline-ui/field"],
} satisfies KeylineItem;

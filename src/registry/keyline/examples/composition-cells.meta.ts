import type { KeylineItem } from "../../item";

export default {
  name: "composition-cells",
  type: "registry:block",
  title: "Composition: declared cells",
  description: "An example of Composition: declared cells.",
  categories: ["guide"],
  files: [{ path: "src/registry/keyline/examples/composition-cells.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/button",
    "@keyline-ui/field",
    "@keyline-ui/keyline",
    "@keyline-ui/panel",
    "@keyline-ui/segmented",
  ],
} satisfies KeylineItem;

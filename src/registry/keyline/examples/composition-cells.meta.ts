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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

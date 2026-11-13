import type { KeylineItem } from "../../item";

export default {
  name: "modes-region",
  type: "registry:block",
  title: "Modes: modes region",
  description: "An example of Modes: modes region.",
  categories: ["guide"],
  files: [{ path: "src/registry/keyline/examples/modes-region.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/button",
    "@keyline-ui/direction",
    "@keyline-ui/field",
    "@keyline-ui/keyline",
    "@keyline-ui/segmented",
    "@keyline-ui/select",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

import type { KeylineItem } from "../../item";

export default {
  name: "config-scope",
  type: "registry:block",
  title: "Configuration: branch theme",
  description: "An example of Configuration: branch theme.",
  categories: ["guide"],
  files: [{ path: "src/registry/keyline/examples/config-scope.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/button",
    "@keyline-ui/checkbox",
    "@keyline-ui/keyline",
    "@keyline-ui/keyline-config",
    "@keyline-ui/segmented",
    "@keyline-ui/select",
    "@keyline-ui/status",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

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
} satisfies KeylineItem;

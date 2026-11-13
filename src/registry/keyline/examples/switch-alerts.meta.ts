import type { KeylineItem } from "../../item";

export default {
  name: "switch-alerts",
  type: "registry:block",
  title: "Switch: alert settings",
  description: "An example of Switch: alert settings.",
  categories: ["switch"],
  files: [{ path: "src/registry/keyline/examples/switch-alerts.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/switch"],
} satisfies KeylineItem;

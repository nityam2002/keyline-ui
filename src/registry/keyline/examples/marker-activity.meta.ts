import type { KeylineItem } from "../../item";

export default {
  name: "marker-activity",
  type: "registry:block",
  title: "Marker: order activity",
  description: "An example of Marker: order activity.",
  categories: ["marker"],
  files: [{ path: "src/registry/keyline/examples/marker-activity.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/marker", "@keyline-ui/status"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

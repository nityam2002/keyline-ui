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
} satisfies KeylineItem;

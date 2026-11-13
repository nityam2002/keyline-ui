import type { KeylineItem } from "../../item";

export default {
  name: "hover-card-client",
  type: "registry:block",
  title: "Hover card: client cards",
  description: "An example of Hover card: client cards.",
  categories: ["hover-card"],
  files: [{ path: "src/registry/keyline/examples/hover-card-client.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/avatar", "@keyline-ui/hover-card", "@keyline-ui/keyline", "@keyline-ui/status"],
} satisfies KeylineItem;

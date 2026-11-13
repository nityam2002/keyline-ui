import type { KeylineItem } from "../../item";

export default {
  name: "breadcrumb-drive",
  type: "registry:block",
  title: "Breadcrumb: drive folder",
  description: "An example of Breadcrumb: drive folder.",
  categories: ["breadcrumb"],
  files: [{ path: "src/registry/keyline/examples/breadcrumb-drive.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/breadcrumb", "@keyline-ui/button", "@keyline-ui/keyline"],
} satisfies KeylineItem;

import type { KeylineItem } from "../../item";

export default {
  name: "skeleton-client",
  type: "registry:block",
  title: "Skeleton: client card",
  description: "An example of Skeleton: client card.",
  categories: ["skeleton"],
  files: [{ path: "src/registry/keyline/examples/skeleton-client.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/button",
    "@keyline-ui/keyline",
    "@keyline-ui/panel",
    "@keyline-ui/skeleton",
    "@keyline-ui/stat",
  ],
} satisfies KeylineItem;

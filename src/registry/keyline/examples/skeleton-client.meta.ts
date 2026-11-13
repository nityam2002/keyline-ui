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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

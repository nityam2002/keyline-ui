import type { KeylineItem } from "../../item";

export default {
  name: "avatar-status",
  type: "registry:block",
  title: "Avatar: whos in",
  description: "An example of Avatar: whos in.",
  categories: ["avatar"],
  files: [{ path: "src/registry/keyline/examples/avatar-status.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/avatar", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

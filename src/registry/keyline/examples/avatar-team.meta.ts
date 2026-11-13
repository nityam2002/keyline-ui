import type { KeylineItem } from "../../item";

export default {
  name: "avatar-team",
  type: "registry:block",
  title: "Avatar: account team",
  description: "An example of Avatar: account team.",
  categories: ["avatar"],
  files: [{ path: "src/registry/keyline/examples/avatar-team.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/avatar", "@keyline-ui/checkbox-group", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

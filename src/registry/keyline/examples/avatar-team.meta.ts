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
} satisfies KeylineItem;

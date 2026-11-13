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
} satisfies KeylineItem;

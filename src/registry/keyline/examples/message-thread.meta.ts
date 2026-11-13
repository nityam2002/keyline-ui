import type { KeylineItem } from "../../item";

export default {
  name: "message-thread",
  type: "registry:block",
  title: "Message: thread with jim",
  description: "An example of Message: thread with jim.",
  categories: ["message"],
  files: [{ path: "src/registry/keyline/examples/message-thread.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/avatar", "@keyline-ui/bubble", "@keyline-ui/keyline", "@keyline-ui/message"],
} satisfies KeylineItem;

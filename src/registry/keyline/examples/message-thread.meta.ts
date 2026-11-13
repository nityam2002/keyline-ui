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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

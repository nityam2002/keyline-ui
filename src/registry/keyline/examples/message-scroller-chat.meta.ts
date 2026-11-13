import type { KeylineItem } from "../../item";

export default {
  name: "message-scroller-chat",
  type: "registry:block",
  title: "Message scroller: driver chat",
  description: "An example of Message scroller: driver chat.",
  categories: ["message-scroller"],
  files: [{ path: "src/registry/keyline/examples/message-scroller-chat.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/avatar",
    "@keyline-ui/bubble",
    "@keyline-ui/button",
    "@keyline-ui/field",
    "@keyline-ui/keyline",
    "@keyline-ui/message",
    "@keyline-ui/message-scroller",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

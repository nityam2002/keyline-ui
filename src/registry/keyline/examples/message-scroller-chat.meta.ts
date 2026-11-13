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
} satisfies KeylineItem;

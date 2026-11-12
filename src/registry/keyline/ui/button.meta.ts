import type { KeylineItem } from "../../item";

export default {
  name: "button",
  type: "registry:ui",
  title: "Button",
  description: "Framed button with affix cells, key travel and pending/done/failed signals.",
  files: [{ path: "src/registry/keyline/ui/button.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/button.css",
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;

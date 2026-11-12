import type { KeylineItem } from "../../item";

export default {
  name: "navigation-menu",
  type: "registry:ui",
  title: "Navigation menu",
  description:
    "Site navigation (Base UI Navigation Menu): a control frame of section triggers and links, the open trigger inverse, the current page cobalt; each section's panel docks to the frame's keyline with link cells on shared seams (title, description, code).",
  files: [{ path: "src/registry/keyline/ui/navigation-menu.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/scroll-edges",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/keyline-render",
  ],
} satisfies KeylineItem;

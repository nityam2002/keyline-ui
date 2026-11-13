import type { KeylineItem } from "../../item";

export default {
  name: "empty",
  type: "registry:ui",
  title: "Empty",
  description:
    "Nothing here, said plainly: a count cell, the message and the way out, in one frame or as a cell. Empty, error and first-use kinds.",
  whenToUse:
    "Use it where a list or view has nothing to show, to say why and offer the way out. For a temporary loading state use Skeleton.",
  files: [{ path: "src/registry/keyline/ui/empty.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
} satisfies KeylineItem;

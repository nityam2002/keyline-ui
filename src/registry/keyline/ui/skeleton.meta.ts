import type { KeylineItem } from "../../item";

export default {
  name: "skeleton",
  type: "registry:ui",
  title: "Skeleton",
  description:
    "A placeholder for content on its way: the table's loading cell outside the table, in line, block, value and control shapes; a busy group that names what is loading.",
  whenToUse:
    "Use it as a placeholder the size of content still loading, so nothing moves when it lands. For a list with nothing in it use Empty; for task progress use Progress.",
  files: [{ path: "src/registry/keyline/ui/skeleton.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
} satisfies KeylineItem;

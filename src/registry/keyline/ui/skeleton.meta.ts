import type { KeylineItem } from "../../item";

export default {
  name: "skeleton",
  type: "registry:ui",
  title: "Skeleton",
  description:
    "A placeholder for content on its way: the table's loading cell outside the table, in line, block, value and control shapes; a busy group that names what is loading.",
  files: [{ path: "src/registry/keyline/ui/skeleton.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
} satisfies KeylineItem;

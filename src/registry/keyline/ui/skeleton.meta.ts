import type { KeylineItem } from "../../item";

export default {
  name: "skeleton",
  type: "registry:ui",
  title: "Skeleton",
  description:
    "A placeholder for content on its way: the table's loading cell outside the table, in line, block, value and control shapes; a busy group that names what is loading.",
  files: [{ path: "src/registry/keyline/ui/skeleton.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/skeleton.css",
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;

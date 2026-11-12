import type { KeylineItem } from "../../item";

export default {
  name: "avatar",
  type: "registry:ui",
  title: "Avatar",
  description:
    "A person or organisation as a square cell (Base UI Avatar): the photo rises in from the bottom keyline, initials hold the cell while it loads or after it fails, status as its floor keyline (a line shape per kind, never over the face); AvatarGroup joins avatars on shared seams with a +N count cell.",
  files: [{ path: "src/registry/keyline/ui/avatar.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
} satisfies KeylineItem;

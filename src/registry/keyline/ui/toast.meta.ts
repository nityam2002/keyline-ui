import type { KeylineItem } from "../../item";

export default {
  name: "toast",
  type: "registry:ui",
  title: "Toast",
  description:
    "Actionable feedback on Base UI Toast that docks into a host cell or floats at the inline-end corner: done, failed, info, warning and loading kinds, a description line, one action (Undo, Retry), the countdown draining the keyline. useToaster() and createToaster() add promise tracking, update and dismiss, and calls from outside React.",
  files: [{ path: "src/registry/keyline/ui/toast.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/toast.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope"],
} satisfies KeylineItem;

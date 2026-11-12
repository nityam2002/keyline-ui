import type { KeylineItem } from "../../item";

export default {
  name: "keyline-motion",
  type: "registry:lib",
  title: "Keyline motion",
  description: "Flood origin, zero-bounce stretch springs and the useStretch hook. No runtime provider.",
  files: [{ path: "src/registry/keyline/lib/keyline-motion.ts", type: "registry:lib" }],
} satisfies KeylineItem;

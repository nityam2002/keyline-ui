import type { KeylineItem } from "../../item";

export default {
  name: "keyline-motion",
  type: "registry:lib",
  title: "Keyline motion",
  description: "Flood origin, zero-bounce stretch springs and the useStretch hook. No runtime provider.",
  files: [{ path: "src/registry/keyline/lib/keyline-motion.ts", type: "registry:lib" }],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

import type { KeylineItem } from "../../item";

export default {
  name: "keyline-render",
  type: "registry:lib",
  title: "Keyline render helpers",
  description:
    "Merge Keyline's classes and styles with a className or style given as a function of state, and mirror variant props to data attributes.",
  files: [{ path: "src/registry/keyline/lib/keyline-render.ts", type: "registry:lib" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["utils"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

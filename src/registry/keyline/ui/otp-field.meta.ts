import type { KeylineItem } from "../../item";

export default {
  name: "otp-field",
  type: "registry:ui",
  title: "OTP field",
  description:
    "A one-time code in one field frame (Base UI OTP Field): a cell per character on shared seams, groups split by a join cell, paste and SMS autofill, a Field participant; verification signals pending, done and failed in the frame.",
  whenToUse:
    "Use it to enter a one-time code, one cell per character, with a checking state and an error. For other short text use Field.",
  files: [{ path: "src/registry/keyline/ui/otp-field.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render", "@keyline-ui/field"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

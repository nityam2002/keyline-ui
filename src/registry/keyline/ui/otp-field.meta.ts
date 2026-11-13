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
} satisfies KeylineItem;

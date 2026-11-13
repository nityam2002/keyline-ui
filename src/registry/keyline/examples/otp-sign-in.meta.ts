import type { KeylineItem } from "../../item";

export default {
  name: "otp-sign-in",
  type: "registry:block",
  title: "OTP field: sign in code",
  description: "An example of OTP field: sign in code.",
  categories: ["otp-field"],
  files: [{ path: "src/registry/keyline/examples/otp-sign-in.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/otp-field"],
} satisfies KeylineItem;

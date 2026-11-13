import type { KeylineItem } from "../../item";

export default {
  name: "alert-dialog",
  type: "registry:ui",
  title: "Alert dialog",
  description:
    "Installs the dialog item, which exports AlertDialog, AlertDialogTrigger, AlertDialogPopup and AlertDialogContent (focus on the safe action, destructive or primary tone) beside Dialog. Import from dialog.",
  files: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/dialog"],
  requires: {
    // an alias with no files: AlertDialog ships in the dialog item
    registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/dialog"],
  },
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;

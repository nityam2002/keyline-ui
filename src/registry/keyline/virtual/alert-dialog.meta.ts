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
} satisfies KeylineItem;
